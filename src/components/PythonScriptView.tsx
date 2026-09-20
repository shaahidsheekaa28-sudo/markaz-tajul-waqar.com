import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, FileText } from 'lucide-react';
import saveAs from 'file-saver';

const PYTHON_DOCX_SCRIPT = `# ============================================================================
# مركز تاج الوقار لعلوم القرآن والآثار - شهر ربيع الثاني ١٤٤٨ هـ
# Markaz Tajul Waqar li Ulum Al-Quran wal Athar
# Teacher Attendance Record Word (.docx) Generator
# ============================================================================

import docx
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from docx.shared import Inches, Pt, RGBColor


def create_attendance_document():
    doc = docx.Document()

    # Page Setup (A4 with standard 0.75 in margins)
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(0.75)
    section.bottom_margin = Inches(0.75)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)

    # Document Header Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("مركز تاج الوقار لعلوم القرآن والآثار")
    r_title.font.name = "Arial"
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x1E, 0x3A, 0x5F)  # Deep Navy

    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("سجل متابعة المعلمين – شهر ربيع الثاني ١٤٤٨ هـ")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(14)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(0x0D, 0x94, 0x88)  # Teal Accent
    p_sub.paragraph_format.space_after = Pt(12)

    # Metadata Info Box (2x2 Grid)
    info_table = doc.add_table(rows=2, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_table.autofit = False

    info_data = [
        [
            ("المدير والمؤسس:", " أستاذ علي محمد ثاني"),
            ("المشرف العام:", " أحمد محمد"),
        ],
        [
            ("أوقات الدوام الصباحي:", " ٣:٢٠ - ٤:٠٠"),
            ("الفترة:", " شهر ربيع الثاني ١٤٤٨ هـ"),
        ],
    ]

    for row_idx, row in enumerate(info_data):
        for col_idx, (label, val) in enumerate(row):
            cell = info_table.cell(row_idx, col_idx)
            cell.width = Inches(3.35)

            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT

            r_lbl = p.add_run(label)
            r_lbl.font.name = "Arial"
            r_lbl.font.size = Pt(10)
            r_lbl.font.bold = True
            r_lbl.font.color.rgb = RGBColor(0x1E, 0x3A, 0x5F)

            r_val = p.add_run(val)
            r_val.font.name = "Arial"
            r_val.font.size = Pt(10)
            r_val.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

            # Soft Gray Background for Info Cards
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F1F5F9"/>')
            cell._tc.get_or_add_tcPr().append(shd)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # Main Data Table Construction
    headers = [
        "التاريخ الهجري",
        "اليوم",
        "اسم المعلم",
        "وقت الحضور",
        "الغياب",
        "التأخير",
        "وقت الانصراف",
        "التوقيع",
    ]

    teachers = [
        "تبيان الشيخ أحمد",
        "أحمد محمد",
        "عبدي شيفو",
        "خضير صادق",
        "براء إبراهيم",
    ]

    schedule_data = [
        ("السبت", ["4:00", "4:00", "4:00", "4:00", "4:00"]),
        ("الأحد", ["4:00", "4:00", "4:00", "4:00", "4:00"]),
        ("الاثنين", ["4:01", "4:02", "4:03", "4:04", "4:05"]),
        ("الثلاثاء", ["4:00", "4:00", "4:00", "4:00", "4:00"]),
        ("الأربعاء", ["4:00", "4:00", "4:00", "4:00", "4:00"]),
        ("السبت", ["4:00", "4:00", "4:00", "4:00", "4:00"]),
        ("الاثنين", ["4:00", "4:00", "4:00", "4:00", "4:00"]),
        ("الثلاثاء", ["4:00", "4:00", "4:00", "4:00", "4:00"]),
        ("الأربعاء", ["4:00", "4:00", "4:00", "4:00", "4:00"]),
    ]

    total_rows = 1 + sum(len(teachers) for _ in schedule_data)
    main_table = doc.add_table(rows=total_rows, cols=8)
    main_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    main_table.autofit = False

    # Force Right-To-Left Table Direction
    bidi_elem = parse_xml(f'<w:bidiVisual {nsdecls("w")}/>')
    main_table._tbl.tblPr.append(bidi_elem)

    col_widths = [
        Inches(1.1),
        Inches(0.8),
        Inches(1.3),
        Inches(0.7),
        Inches(0.5),
        Inches(0.5),
        Inches(0.8),
        Inches(0.8),
    ]

    # Header Row Styling
    hdr_cells = main_table.rows[0].cells
    for i, h_text in enumerate(headers):
        cell = hdr_cells[i]
        cell.width = col_widths[i]
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

        run = p.add_run(h_text)
        run.font.name = "Arial"
        run.font.size = Pt(10)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="1E3A5F"/>')
        cell._tc.get_or_add_tcPr().append(shd)

    # Populate Rows with Alternating Shading
    curr_row = 1
    for day_name, departure_times in schedule_data:
        for idx, teacher_name in enumerate(teachers):
            row_cells = main_table.rows[curr_row].cells
            row_data = [
                "ربيع الثاني ١٤٤٨ هـ",
                day_name,
                teacher_name,
                "3:20",
                "",
                "",
                departure_times[idx],
                "",
            ]

            fill_hex = "F8FAFC" if (curr_row % 2 == 0) else "FFFFFF"

            for c_idx, val in enumerate(row_data):
                cell = row_cells[c_idx]
                cell.width = col_widths[c_idx]
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

                p = cell.paragraphs[0]
                p.alignment = (
                    WD_ALIGN_PARAGRAPH.RIGHT
                    if c_idx == 2
                    else WD_ALIGN_PARAGRAPH.CENTER
                )

                run = p.add_run(val)
                run.font.name = "Arial"
                run.font.size = Pt(9.5)
                run.font.bold = True if c_idx == 2 else False
                run.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

                # Shading and subtle borders
                shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
                borders = parse_xml(f'''
                    <w:tcBorders {nsdecls("w")}>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                    </w:tcBorders>
                ''')
                tcPr = cell._tc.get_or_add_tcPr()
                tcPr.append(shd)
                tcPr.append(borders)

            curr_row += 1

    # Save to file
    doc.save("Teacher_Attendance_Record.docx")


create_attendance_document()
`;

const PYTHON_EXCEL_SCRIPT = `# ============================================================================
# مركز تاج الوقار لعلوم القرءان والآثار - 1448 هـ
# Markaz Tajul Waqar li Ulum Al-Quran wal Athar
# ============================================================================

import pandas as pd
import numpy as np
from datetime import datetime
import re
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side, GradientFill
from openpyxl.utils import get_column_letter

# Center Information
CENTER_NAME_AR = "مركز تاج الوقار لعلوم القرءان والآثار"
CENTER_NAME_EN = "Markaz Tajul Waqar li Ulum Al-Quran wal Athar"

# Professional Modern Color Palette
COLORS = {
    'primary': '1B2A4A',      # Deep Navy
    'secondary': '2C3E7A',    # Royal Blue
    'accent': 'E8A87C',       # Warm Gold
    'weekend': 'F0E6E6',      # Light Red for weekends
    'study': 'E8F0FE',        # Light Blue for study days
    'student_row': 'F7F9FC',  # Very light blue for student rows
    'alternate_row': 'EDF2F7' # Light gray-blue for alternate rows
}

GROUPS = {
    'زيدي': {
        'students': ['بارينتو', 'محمد', 'إمام الدين', 'حسن', 'حسن عبد الرحمن', 'عمار', 'خالد', 'معاذ'],
        'columns': ['الرقم', 'إسم الطالب', 'السورة من آية إلى آية', 'تنبيه', 'تردد', 'توقف', 'فتح', 'سمع / لم يسمع', 'الصغرى', 'العظمى/الكبرى', 'حاضر / غائب', 'الواجب', 'توقيع المعلم']
    },
    'أبي بن كعب': {
        'students': ['شمس الدين', 'روبا', 'مولس', 'غمتشو', 'شريم', 'عبد الله', 'نجاش', 'أمين', 'بارينتو', 'حاجي'],
        'columns': ['الرقم', 'إسم الطالب', 'السورة من آية إلى آية', 'تنبيه', 'تردد', 'توقف', 'فتح', 'سمع / لم يسمع', 'الصغرى', 'العظمى/الكبرى', 'حاضر / غائب', 'الواجب', 'توقيع المعلم']
    },
    'عبدالله بن مسعود': {
        'students': ['معروف', 'بخاصو', 'محمد', 'ديني', 'مراد', 'دكتور', 'أسامة', 'أنصار'],
        'columns': ['الرقم', 'إسم الطالب', 'السورة من آية إلى آية', 'تنبيه', 'تردد', 'توقف', 'فتح', 'سمع / لم يسمع', 'الصغرى', 'العظمى/الكبرى', 'حاضر / غائب', 'الواجب', 'توقيع المعلم']
    },
    'معاذ': {
        'students': ['معاذ', 'معروف', 'سلمان', 'إمام الدين', 'أحمد', 'عبيدة', 'محمد', 'يوسف'],
        'columns': ['الرقم', 'إسم الطالب', 'السورة من آية إلى آية', 'تنبيه', 'تردد', 'توقف', 'فتح', 'سمع / لم يسمع', 'الصغرى', 'العظمى/الكبرى', 'حاضر / غائب', 'الواجب', 'الملاحظة والتنبيه والتقييم', 'توقيع المعلم']
    }
}

HIJRI_MONTHS = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
]

ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

print("مركز تاج الوقار لعلوم القرءان والآثار - تم الشغيل بنجاح")
`;

const NODE_TEACHER_AUTH_SCRIPT = `/**
 * Markaz Tajul Waqar li Ulum Al-Quran wal Athar
 * Teacher Authentication Portal Backend (Node.js / Express / Firestore)
 * 
 * Lookup 'users/{phoneNumber}' in Firestore, verify password,
 * ensure role === 'teacher', and return unique teacherCode.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import express from 'express';

// 1. Firebase Config for Markaz Tajul Waqar
const firebaseConfig = {
  projectId: "exemplary-hearth-xdw77",
  appId: "1:618410332024:web:3080335d4ad9a1d790828d",
  apiKey: "AIzaSyA-ihJ8iKPjOGfYBC5Yax2r11xXuwJ04Nk",
  authDomain: "exemplary-hearth-xdw77.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-1448-95dfecc6-9a1c-42eb-9d8a-22bbf53521da"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Authenticates a teacher from Firestore
 * @param {string} phoneNumber - e.g. "+251912345678"
 * @param {string} password - Markaz-assigned password
 */
export async function authenticateTeacherFromMarkaz(phoneNumber, password) {
  const cleanPhone = (phoneNumber || '').trim();

  // 1. Validation
  if (!cleanPhone || !password) {
    return {
      success: false,
      statusCode: 400,
      code: 'MISSING_CREDENTIALS',
      message: 'Lakkofsi bilbilaa fi jechi iccitii barbaachisaadha.'
    };
  }

  try {
    // 2. Query Firestore 'users' collection by phoneNumber document ID
    const userDocRef = doc(db, 'users', cleanPhone);
    const snapshot = await getDoc(userDocRef);

    // Error 1: Unregistered phone number
    if (!snapshot.exists()) {
      return {
        success: false,
        statusCode: 404,
        code: 'UNREGISTERED_PHONE',
        message: 'Lakkofsi bilbilaa kun markaza keessatti hin galmeeffamne!'
      };
    }

    const userData = snapshot.data();

    // Error 2: Incorrect password
    if (userData.password !== password) {
      return {
        success: false,
        statusCode: 401,
        code: 'INCORRECT_PASSWORD',
        message: 'Jechi iccitii (Password) galchitan sirrii miti!'
      };
    }

    // Error 3: Wrong role (not teacher)
    if (userData.role !== 'teacher') {
      return {
        success: false,
        statusCode: 403,
        code: 'WRONG_ROLE',
        message: 'Akaawuntiin kun kan barsiisaa miti. Seensifamuuf eeyyama hin qabdu.'
      };
    }

    // Success: Retrieve teacher code and info
    return {
      success: true,
      statusCode: 200,
      code: 'AUTH_SUCCESS',
      message: 'Baga nagaan dhuftan!',
      teacherCode: userData.teacherCode || 'TW-TEACHER',
      displayName: userData.displayName || 'Barsiisaa Markazaa',
      data: {
        teacherCode: userData.teacherCode || 'TW-TEACHER',
        displayName: userData.displayName,
        phoneNumber: cleanPhone,
        role: userData.role,
        department: userData.department || "Qur'an Studies"
      }
    };
  } catch (err) {
    console.error('Firestore Error:', err);
    return {
      success: false,
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'Gara sirnaatti seenuun hin danda\'amne. Mee irra deebii yaalaa.'
    };
  }
}

// 3. Express API Route Example
const server = express();
server.use(express.json());

server.post('/api/auth/teacher-login', async (req, res) => {
  const { phoneNumber, password } = req.body;
  const result = await authenticateTeacherFromMarkaz(phoneNumber, password);
  return res.status(result.statusCode).json(result);
});

server.listen(3000, () => {
  console.log('Teacher Auth Server listening on http://localhost:3000');
});
`;

export const PythonScriptView: React.FC = () => {
  const [activeScriptTab, setActiveScriptTab] = useState<'docx' | 'excel' | 'node_backend'>('docx');
  const [copied, setCopied] = useState(false);

  let currentCode = PYTHON_DOCX_SCRIPT;
  let currentFileName = 'Teacher_Attendance_Record.py';

  if (activeScriptTab === 'excel') {
    currentCode = PYTHON_EXCEL_SCRIPT;
    currentFileName = 'generate_excel_tajulwaqar.py';
  } else if (activeScriptTab === 'node_backend') {
    currentCode = NODE_TEACHER_AUTH_SCRIPT;
    currentFileName = 'teacher_portal_backend.js';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/x-python;charset=utf-8' });
    saveAs(blob, currentFileName);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 mb-6 text-right">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1B2A4A] text-[#E8A87C] flex items-center justify-center">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">سكربتات Python الرسمية للمركز</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              أكواد Python المعتمدة لتوليد مستندات Word (.docx) وسجلات Excel (openpyxl)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white text-xs font-bold transition-all shadow cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#E8A87C]" />
            <span>تحميل {currentFileName}</span>
          </button>
        </div>
      </div>

      {/* Script Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setActiveScriptTab('docx')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeScriptTab === 'docx'
              ? 'bg-[#1E3A5F] text-white shadow'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-[#E8A87C]" />
          <span>سجل متابعة المعلمين (python-docx)</span>
        </button>

        <button
          onClick={() => setActiveScriptTab('excel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeScriptTab === 'excel'
              ? 'bg-[#1E3A5F] text-white shadow'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4 text-[#E8A87C]" />
          <span>سجل تقييم الحلقات (openpyxl)</span>
        </button>

        <button
          onClick={() => setActiveScriptTab('node_backend')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeScriptTab === 'node_backend'
              ? 'bg-[#E67E22] text-white shadow'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4 text-white" />
          <span>سكربت Node.js لتوثيق دخول المعلم (Firestore Auth)</span>
        </button>
      </div>

      {/* Code Container */}
      <div className="bg-[#1E293B] text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto dir-ltr text-left border border-slate-800 leading-relaxed shadow-inner max-h-96">
        <pre>{currentCode}</pre>
      </div>

      <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
        <span>💡</span>
        <span>
          {activeScriptTab === 'node_backend' ? (
            <>
              تشغيل سكربت الباك إند عبر Node.js:{' '}
              <code className="bg-amber-100 px-2 py-0.5 rounded font-mono text-amber-950 font-bold">
                node {currentFileName}
              </code>{' '}
              (أو إرسال POST Request إلى{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">
                /api/auth/teacher-login
              </code>
              ).
            </>
          ) : (
            <>
              يمكنك تشغيل هذا السكربت محلياً عبر الأمر:{' '}
              <code className="bg-amber-100 px-2 py-0.5 rounded font-mono text-amber-950 font-bold">
                python {currentFileName}
              </code>{' '}
              (يتطلب تثبيت{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">
                pip install {activeScriptTab === 'docx' ? 'python-docx' : 'openpyxl pandas'}
              </code>
              ).
            </>
          )}
        </span>
      </div>
    </div>
  );
};
