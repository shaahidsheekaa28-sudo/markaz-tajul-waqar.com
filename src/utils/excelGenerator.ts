import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { GroupConfig, EvaluationDataMap, ExportScope } from '../types';
import { CENTER_NAME_AR, CENTER_NAME_EN, COLORS } from '../data/initialData';
import {
  HIJRI_MONTHS,
  getRemainingMonths1448,
  generateHijriMonthCalendar,
} from './hijriCalendar';

// Helper to format hex colors for exceljs (needs ARGB string, e.g. "FF1B2A4A")
function argb(hex: string): string {
  const cleanHex = hex.replace('#', '');
  return cleanHex.length === 6 ? `FF${cleanHex}` : cleanHex;
}

export async function generateExcelWorkbook({
  groups,
  monthsScope,
  selectedSingleGroup,
  selectedSingleMonth,
  evaluationMap = {},
  filename,
}: {
  groups: GroupConfig[];
  monthsScope: ExportScope;
  selectedSingleGroup?: GroupConfig;
  selectedSingleMonth?: string;
  evaluationMap?: EvaluationDataMap;
  filename?: string;
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = CENTER_NAME_AR;
  workbook.created = new Date();

  // Determine target groups
  const targetGroups = selectedSingleGroup ? [selectedSingleGroup] : groups;

  // Determine months list
  let targetMonths: string[] = [];
  if (monthsScope === 'remaining') {
    targetMonths = getRemainingMonths1448();
  } else if (monthsScope === 'full_year') {
    targetMonths = [...HIJRI_MONTHS];
  } else if (monthsScope === 'current_month' && selectedSingleMonth) {
    targetMonths = [selectedSingleMonth];
  } else {
    targetMonths = getRemainingMonths1448();
  }

  // Create a sheet for each target group
  for (const group of targetGroups) {
    const isMuadh = group.isMuadhSpecial || group.name === 'معاذ';
    const numCols = isMuadh ? 14 : 13;
    const sheetTitle = `حلقة ${group.name}`.substring(0, 31);
    
    const ws = workbook.addWorksheet(sheetTitle, {
      views: [{ rightToLeft: true }],
      pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    let currentRow = 1;

    // Row 1: Center Name in Arabic
    ws.mergeCells(currentRow, 1, currentRow, numCols);
    const row1Cell = ws.getCell(currentRow, 1);
    row1Cell.value = CENTER_NAME_AR;
    row1Cell.font = { name: 'Traditional Arabic', size: 20, bold: true, color: { argb: argb(COLORS.white) } };
    row1Cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    row1Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(COLORS.primary) } };
    row1Cell.border = {
      top: { style: 'thick', color: { argb: argb(COLORS.accent) } },
      bottom: { style: 'thick', color: { argb: argb(COLORS.accent) } },
      left: { style: 'thick', color: { argb: argb(COLORS.accent) } },
      right: { style: 'thick', color: { argb: argb(COLORS.accent) } },
    };
    ws.getRow(currentRow).height = 36;
    currentRow++;

    // Row 2: Center Name in English
    ws.mergeCells(currentRow, 1, currentRow, numCols);
    const row2Cell = ws.getCell(currentRow, 1);
    row2Cell.value = CENTER_NAME_EN;
    row2Cell.font = { name: 'Arial', size: 13, bold: true, color: { argb: argb(COLORS.accent) } };
    row2Cell.alignment = { horizontal: 'center', vertical: 'middle' };
    row2Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(COLORS.secondary) } };
    ws.getRow(currentRow).height = 24;
    currentRow++;

    // Row 3: Separator line
    ws.mergeCells(currentRow, 1, currentRow, numCols);
    const row3Cell = ws.getCell(currentRow, 1);
    row3Cell.value = "✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦";
    row3Cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: argb(COLORS.accent) } };
    row3Cell.alignment = { horizontal: 'center', vertical: 'middle' };
    row3Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(COLORS.primary) } };
    ws.getRow(currentRow).height = 18;
    currentRow++;

    // Row 4: Group Title
    ws.mergeCells(currentRow, 1, currentRow, numCols);
    const row4Cell = ws.getCell(currentRow, 1);
    const scopeLabel = monthsScope === 'full_year'
      ? 'سنة ١٤٤٨ هـ كاملة'
      : monthsScope === 'current_month'
      ? `شهر ${selectedSingleMonth || ''} ١٤٤٨ هـ`
      : 'باقي شهور ١٤٤٨ هـ';
    
    const teacherLabel = group.teacherName ? ` (أستاذ الحلقة: ${group.teacherName})` : '';
    row4Cell.value = `سجل المتابعة اليومي الشامل لمجموعة: حلقة ${group.name}${teacherLabel} — ${scopeLabel}`;
    row4Cell.font = { name: 'Arial', size: 15, bold: true, color: { argb: argb(COLORS.white) } };
    row4Cell.alignment = { horizontal: 'center', vertical: 'middle' };
    row4Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(COLORS.secondary) } };
    ws.getRow(currentRow).height = 28;
    currentRow++;

    // Row 5: Months info
    ws.mergeCells(currentRow, 1, currentRow, numCols);
    const row5Cell = ws.getCell(currentRow, 1);
    row5Cell.value = `الأشهر المدرجة: ${targetMonths.join('، ')}`;
    row5Cell.font = { name: 'Arial', size: 9, italic: true, color: { argb: argb(COLORS.gray) } };
    row5Cell.alignment = { horizontal: 'center', vertical: 'middle' };
    row5Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(COLORS.light_gray) } };
    ws.getRow(currentRow).height = 18;
    currentRow++;

    // Row 6: Legend
    ws.mergeCells(currentRow, 1, currentRow, numCols);
    const row6Cell = ws.getCell(currentRow, 1);
    row6Cell.value = "📚 أيام الدراسة  |  🎯 أيام العطلة (الخميس والجمعة)  |  الأيام المظللة باللون الرمادي هي أيام عطلة";
    row6Cell.font = { name: 'Arial', size: 9, italic: true, color: { argb: argb(COLORS.gray) } };
    row6Cell.alignment = { horizontal: 'center', vertical: 'middle' };
    row6Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(COLORS.light_gray) } };
    ws.getRow(currentRow).height = 18;
    currentRow++;

    // Row 7: Spacer
    currentRow++;

    // Process each Month
    for (const monthName of targetMonths) {
      const calData = generateHijriMonthCalendar(monthName, 1448);
      const monthIdxStr = (HIJRI_MONTHS.indexOf(monthName) + 1).toString().padStart(2, '0');

      // Month Header Row
      ws.mergeCells(currentRow, 1, currentRow, numCols);
      const monthCell = ws.getCell(currentRow, 1);
      monthCell.value = `══════ شهر ${monthName} — ${calData.days_in_month} يوم ══════`;
      monthCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: argb(COLORS.white) } };
      monthCell.alignment = { horizontal: 'center', vertical: 'middle' };
      monthCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(COLORS.primary) } };
      ws.getRow(currentRow).height = 26;
      currentRow++;

      // Process Days
      for (const dayObj of calData.days) {
        const dateStr = `${dayObj.weekday} ${dayObj.day.toString().padStart(2, '0')} / ${monthIdxStr} / 1448 هـ`;
        const dayHeader = dayObj.is_weekend
          ? `📅 ${dateStr} — عطلة ${dayObj.weekday}`
          : `📚 ${dateStr} — يوم دراسة`;

        // Day Header
        ws.mergeCells(currentRow, 1, currentRow, numCols);
        const dayCell = ws.getCell(currentRow, 1);
        dayCell.value = dayHeader;
        dayCell.alignment = { horizontal: 'center', vertical: 'middle' };

        if (dayObj.is_weekend) {
          dayCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF8B0000' } };
          dayCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(COLORS.weekend) } };
        } else {
          dayCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: argb(COLORS.primary) } };
          dayCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(COLORS.study) } };
        }
        dayCell.border = {
          top: { style: 'thin', color: { argb: argb(COLORS.gray) } },
          bottom: { style: 'thin', color: { argb: argb(COLORS.gray) } },
          left: { style: 'thin', color: { argb: argb(COLORS.gray) } },
          right: { style: 'thin', color: { argb: argb(COLORS.gray) } },
        };
        ws.getRow(currentRow).height = 22;
        currentRow++;

        // Column Headers
        for (let colIdx = 0; colIdx < group.columns.length; colIdx++) {
          const colCell = ws.getCell(currentRow, colIdx + 1);
          colCell.value = group.columns[colIdx];
          colCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: argb(COLORS.white) } };
          colCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          colCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(COLORS.secondary) } };
          colCell.border = {
            top: { style: 'thin', color: { argb: argb(COLORS.white) } },
            bottom: { style: 'thin', color: { argb: argb(COLORS.white) } },
            left: { style: 'thin', color: { argb: argb(COLORS.white) } },
            right: { style: 'thin', color: { argb: argb(COLORS.white) } },
          };
        }
        ws.getRow(currentRow).height = 24;
        currentRow++;

        // Student Rows
        for (let sIdx = 0; sIdx < group.students.length; sIdx++) {
          const student = group.students[sIdx];
          const isAlternate = sIdx % 2 === 1;

          // Check if evaluation data exists for this student on this day
          const evalKey = `${group.id}_${monthName}_${dayObj.day}_${student.id}`;
          const rec = evaluationMap[evalKey] || {};

          // Prepare row data corresponding to columns
          const rowValues: (string | number)[] = [
            sIdx + 1,                                       // الرقم
            student.name,                                   // إسم الطالب
            rec.surahVerses || '',                          // السورة
            rec.notice || '',                               // تنبيه
            rec.hesitation || '',                           // تردد
            rec.stoppage || '',                             // توقف
            rec.prompt || '',                               // فتح
            rec.recited || '',                              // سمع / لم يسمع
            rec.minorReview || '',                          // الصغرى
            rec.majorReview || '',                          // العظمى/الكبرى
            rec.attendance || (dayObj.is_weekend ? '' : 'حاضر'), // حاضر / غائب
            rec.homework || '',                             // الواجب
          ];

          if (isMuadh) {
            rowValues.push(rec.notes || '');               // الملاحظة والتقييم
          }

          rowValues.push(rec.signed ? 'موقع ✓' : '');      // توقيع المعلم

          // Apply row cells
          for (let cIdx = 0; cIdx < rowValues.length; cIdx++) {
            const cell = ws.getCell(currentRow, cIdx + 1);
            cell.value = rowValues[cIdx];
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

            if (cIdx === 1) { // Student name
              cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: argb(COLORS.primary) } };
            } else {
              cell.font = { name: 'Arial', size: 10, color: { argb: argb(COLORS.dark) } };
            }

            // Fill color
            let fillHex = COLORS.student_row;
            if (dayObj.is_weekend) {
              fillHex = COLORS.weekend;
            } else if (isAlternate) {
              fillHex = COLORS.alternate_row;
            }

            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(fillHex) } };
            cell.border = {
              top: { style: 'thin', color: { argb: argb(COLORS.gray) } },
              bottom: { style: 'thin', color: { argb: argb(COLORS.gray) } },
              left: { style: 'thin', color: { argb: argb(COLORS.gray) } },
              right: { style: 'thin', color: { argb: argb(COLORS.gray) } },
            };
          }
          ws.getRow(currentRow).height = 20;
          currentRow++;
        }

        // Spacer between days
        currentRow++;
      }

      // Spacer between months
      currentRow++;
    }

    // Footer
    ws.mergeCells(currentRow, 1, currentRow, numCols);
    const fCell1 = ws.getCell(currentRow, 1);
    fCell1.value = "✦ ✦ ✦ مركز تاج الوقار لعلوم القرءان والآثار ✦ ✦ ✦";
    fCell1.font = { name: 'Arial', size: 12, bold: true, color: { argb: argb(COLORS.white) } };
    fCell1.alignment = { horizontal: 'center', vertical: 'middle' };
    fCell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(COLORS.primary) } };
    ws.getRow(currentRow).height = 24;
    currentRow++;

    ws.mergeCells(currentRow, 1, currentRow, numCols);
    const fCell2 = ws.getCell(currentRow, 1);
    fCell2.value = "© 1448 هـ - جميع الحقوق محفوظة لمركز تاج الوقار";
    fCell2.font = { name: 'Arial', size: 10, color: { argb: argb(COLORS.gray) } };
    fCell2.alignment = { horizontal: 'center', vertical: 'middle' };
    fCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(COLORS.light_gray) } };
    ws.getRow(currentRow).height = 20;

    // Set Column Widths
    ws.getColumn(1).width = 8;   // الرقم
    ws.getColumn(2).width = 22;  // إسم الطالب
    ws.getColumn(3).width = 28;  // السورة
    ws.getColumn(4).width = 12;  // تنبيه
    ws.getColumn(5).width = 10;  // تردد
    ws.getColumn(6).width = 10;  // توقف
    ws.getColumn(7).width = 10;  // فتح
    ws.getColumn(8).width = 14;  // سمع / لم يسمع
    ws.getColumn(9).width = 12;  // الصغرى
    ws.getColumn(10).width = 12; // العظمى
    ws.getColumn(11).width = 14; // حاضر / غائب
    ws.getColumn(12).width = 15; // الواجب
    ws.getColumn(13).width = isMuadh ? 25 : 18; // الملاحظة / التوقيع
    if (isMuadh) {
      ws.getColumn(14).width = 18; // التوقيع
    }
  }

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const finalFileName = filename || (
    selectedSingleGroup
      ? `مركز_تاج_الوقار_حلقة_${selectedSingleGroup.name}_1448.xlsx`
      : monthsScope === 'full_year'
      ? `مركز_تاج_الوقار_السجل_السنوي_1448.xlsx`
      : `مركز_تاج_الوقار_سجل_الحلقات_1448.xlsx`
  );

  saveAs(blob, finalFileName);
  return finalFileName;
}
