import html2pdf from 'html2pdf.js';
import { GroupConfig, HijriCalendarData, EvaluationDataMap } from '../types';
import { CENTER_NAME_AR, CENTER_NAME_EN } from '../data/initialData';

export interface PdfExportOptions {
  group: GroupConfig;
  calendarData: HijriCalendarData;
  evaluationMap: EvaluationDataMap;
  selectedDayNumber: number | 'all';
  viewMode: 'all_days' | 'study_only' | 'weekend_only';
}

/**
 * Pure JS fallback to convert oklab(L a b [/ alpha]) to rgb/rgba
 */
function parseOklabToRgb(str: string): string {
  const match = str.match(/oklab\(\s*([0-9#%.eE+-]+)\s+([0-9#%.eE+-]+)\s+([0-9#%.eE+-]+)(?:\s*\/\s*([0-9#%.eE+-]+))?\s*\)/i);
  if (!match) return 'rgb(0, 0, 0)';

  let l = parseFloat(match[1]);
  if (match[1].endsWith('%')) l /= 100;

  let a = parseFloat(match[2]);
  if (match[2].endsWith('%')) a /= 100;

  let b = parseFloat(match[3]);
  if (match[3].endsWith('%')) b /= 100;

  let alpha = match[4] ? parseFloat(match[4]) : 1;
  if (match[4] && match[4].endsWith('%')) alpha /= 100;

  const l_ = l;
  const m_ = l_ - 0.1055619695 * a - 0.0638541728 * b;
  const s_ = l_ - 0.0894841775 * a - 1.2914855480 * b;
  const l3 = l_ + 0.3963377774 * a + 0.2158037573 * b;

  const l_c = l3 * l3 * l3;
  const m_c = m_ * m_ * m_;
  const s_c = s_ * s_ * s_;

  const r = +4.0767416621 * l_c - 3.3077115913 * m_c + 0.2309699292 * s_c;
  const g = -1.2684380046 * l_c + 2.6097574011 * m_c - 0.3413193965 * s_c;
  const bVal = -0.0041960863 * l_c - 0.7034186147 * m_c + 1.7076147010 * s_c;

  const gamma = (c: number) => {
    const abs = Math.abs(c);
    if (abs <= 0.0031308) return 12.92 * c;
    return (Math.sign(c) || 1) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
  };

  const R = Math.max(0, Math.min(255, Math.round(gamma(r) * 255)));
  const G = Math.max(0, Math.min(255, Math.round(gamma(g) * 255)));
  const B = Math.max(0, Math.min(255, Math.round(gamma(bVal) * 255)));

  return alpha < 1 ? `rgba(${R}, ${G}, ${B}, ${alpha})` : `rgb(${R}, ${G}, ${B})`;
}

/**
 * Pure JS fallback to convert oklch(L C H [/ alpha]) to rgb/rgba
 */
function parseOklchToRgb(str: string): string {
  const match = str.match(/oklch\(\s*([0-9#%.eE+-]+)\s+([0-9#%.eE+-]+)\s+([0-9#%.eE+-]+)(?:\s*\/\s*([0-9#%.eE+-]+))?\s*\)/i);
  if (!match) return 'rgb(0, 0, 0)';

  let l = parseFloat(match[1]);
  if (match[1].endsWith('%')) l /= 100;

  let c = parseFloat(match[2]);
  if (match[2].endsWith('%')) c /= 100;

  let h = parseFloat(match[3]);
  const hRad = (h * Math.PI) / 180;

  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  let alpha = match[4] ? parseFloat(match[4]) : 1;
  if (match[4] && match[4].endsWith('%')) alpha /= 100;

  return parseOklabToRgb(`oklab(${l} ${a} ${b} / ${alpha})`);
}

const canvasCache = new Map<string, string>();
let canvasCtx: CanvasRenderingContext2D | null = null;

/**
 * Helper to convert modern color functions like oklch(...), oklab(...), lch(...), lab(...)
 * to standard rgb(...)/rgba(...) strings so html2canvas can parse them without errors.
 */
export function convertOklchToRgb(cssText: string): string {
  if (!cssText || !/(?:oklch|oklab|lch|lab|color)\(/i.test(cssText)) {
    return cssText;
  }

  return cssText.replace(/(?:oklch|oklab|lch|lab|color)\([^)]+\)/gi, (match) => {
    if (canvasCache.has(match)) return canvasCache.get(match)!;

    let res = '';
    try {
      if (!canvasCtx) {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        canvasCtx = canvas.getContext('2d');
      }
      if (canvasCtx) {
        canvasCtx.fillStyle = 'rgba(0,0,0,0)';
        canvasCtx.fillRect(0, 0, 1, 1);
        canvasCtx.fillStyle = match;
        canvasCtx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = canvasCtx.getImageData(0, 0, 1, 1).data;
        const alpha = +(a / 255).toFixed(2);
        res = alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
      }
    } catch {
      // ignore
    }

    if (!res || /(?:oklch|oklab|lch|lab|color)\(/i.test(res)) {
      const lower = match.toLowerCase();
      if (lower.startsWith('oklch')) {
        res = parseOklchToRgb(match);
      } else if (lower.startsWith('oklab')) {
        res = parseOklabToRgb(match);
      } else {
        res = 'rgb(0, 0, 0)';
      }
    }

    canvasCache.set(match, res);
    return res;
  });
}

/**
 * Downloads the register table or element directly as a high quality PDF
 */
export async function downloadRegisterPdf(
  elementId: string,
  fileName: string = 'Taj_Ul_Waqar_Register.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found for PDF export.`);
  }

  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      onclone: (clonedDoc: Document) => {
        // 1. Convert modern color functions in all <style> elements
        const styleElements = clonedDoc.querySelectorAll('style');
        styleElements.forEach((style) => {
          if (style.textContent && /(?:oklch|oklab|lch|lab|color)\(/i.test(style.textContent)) {
            style.textContent = convertOklchToRgb(style.textContent);
          }
        });

        // 2. Convert modern color functions in inline style attributes
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const styleAttr = htmlEl.getAttribute?.('style');
          if (styleAttr && /(?:oklch|oklab|lch|lab|color)\(/i.test(styleAttr)) {
            htmlEl.setAttribute('style', convertOklchToRgb(styleAttr));
          }
          if (htmlEl.style?.cssText && /(?:oklch|oklab|lch|lab|color)\(/i.test(htmlEl.style.cssText)) {
            htmlEl.style.cssText = convertOklchToRgb(htmlEl.style.cssText);
          }
        });

        // 3. Clean all styleSheets in clonedDoc to ensure no cssRules have oklab/oklch
        try {
          Array.from(clonedDoc.styleSheets).forEach((sheet) => {
            try {
              const rules = sheet.cssRules || sheet.rules;
              if (rules) {
                Array.from(rules).forEach((rule) => {
                  if (rule.cssText && /(?:oklch|oklab|lch|lab|color)\(/i.test(rule.cssText)) {
                    if ('style' in rule && (rule as CSSStyleRule).style) {
                      const styleObj = (rule as CSSStyleRule).style;
                      for (let i = 0; i < styleObj.length; i++) {
                        const prop = styleObj[i];
                        const val = styleObj.getPropertyValue(prop);
                        if (/(?:oklch|oklab|lch|lab|color)\(/i.test(val)) {
                          styleObj.setProperty(prop, convertOklchToRgb(val));
                        }
                      }
                    }
                  }
                });
              }
            } catch {
              // Ignore cross-origin stylesheet errors
            }
          });
        } catch {
          // Ignore
        }
      },
    },
    jsPDF: {
      unit: 'in',
      format: 'a4',
      orientation: 'landscape',
    },
  };

  // @ts-ignore
  await html2pdf().set(opt).from(element).save();
}

/**
 * Trigger native window print formatted for PDF saving
 */
export function triggerPrintPdf(): void {
  window.print();
}

