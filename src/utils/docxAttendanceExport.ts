import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType,
  BorderStyle,
  VerticalAlign,
  convertInchesToTwip,
} from 'docx';
import saveAs from 'file-saver';

export interface TeacherRecordRow {
  hijriDate: string;
  day: string;
  teacherName: string;
  checkInTime: string;
  absence: string;
  delay: string;
  checkOutTime: string;
  signature: string;
}

export const DEFAULT_TEACHER_RECORDS: TeacherRecordRow[] = [
  // السبت 1
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'السبت', teacherName: 'تبيان الشيخ أحمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'السبت', teacherName: 'أحمد محمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'السبت', teacherName: 'عبدي شيفو', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'السبت', teacherName: 'خضير صادق', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'السبت', teacherName: 'براء إبراهيم', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  // الأحد
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأحد', teacherName: 'تبيان الشيخ أحمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤8 هـ', day: 'الأحد', teacherName: 'أحمد محمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأحد', teacherName: 'عبدي شيفو', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأحد', teacherName: 'خضير صادق', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأحد', teacherName: 'براء إبراهيم', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  // الاثنين 1
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الاثنين', teacherName: 'تبيان الشيخ أحمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:01', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الاثنين', teacherName: 'أحمد محمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:02', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الاثنين', teacherName: 'عبدي شيفو', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:03', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الاثنين', teacherName: 'خضير صادق', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:04', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الاثنين', teacherName: 'براء إبراهيم', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:05', signature: '' },
  // الثلاثاء 1
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الثلاثاء', teacherName: 'تبيان الشيخ أحمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الثلاثاء', teacherName: 'أحمد محمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الثلاثاء', teacherName: 'عبدي شيفو', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الثلاثاء', teacherName: 'خضير صادق', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الثلاثاء', teacherName: 'براء إبراهيم', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  // الأربعاء 1
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأربعاء', teacherName: 'تبيان الشيخ أحمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأربعاء', teacherName: 'أحمد محمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأربعاء', teacherName: 'عبدي شيفو', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأربعاء', teacherName: 'خضير صادق', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأربعاء', teacherName: 'براء إبراهيم', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  // السبت 2
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'السبت', teacherName: 'تبيان الشيخ أحمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'السبت', teacherName: 'أحمد محمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'السبت', teacherName: 'عبدي شيفو', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'السبت', teacherName: 'خضير صادق', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'السبت', teacherName: 'براء إبراهيم', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  // الاثنين 2
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الاثنين', teacherName: 'تبيان الشيخ أحمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الاثنين', teacherName: 'أحمد محمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الاثنين', teacherName: 'عبدي شيفو', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الاثنين', teacherName: 'خضير صادق', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الاثنين', teacherName: 'براء إبراهيم', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  // الثلاثاء 2
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الثلاثاء', teacherName: 'تبيان الشيخ أحمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الثلاثاء', teacherName: 'أحمد محمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الثلاثاء', teacherName: 'عبدي شيفو', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الثلاثاء', teacherName: 'خضير صادق', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الثلاثاء', teacherName: 'براء إبراهيم', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  // الأربعاء 2
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأربعاء', teacherName: 'تبيان الشيخ أحمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأربعاء', teacherName: 'أحمد محمد', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأربعاء', teacherName: 'عبدي شيفو', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأربعاء', teacherName: 'خضير صادق', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
  { hijriDate: 'ربيع الثاني ١٤٤٨ هـ', day: 'الأربعاء', teacherName: 'براء إبراهيم', checkInTime: '3:20', absence: '', delay: '', checkOutTime: '4:00', signature: '' },
];

export async function generateAndDownloadTeacherAttendanceDocx(records: TeacherRecordRow[] = DEFAULT_TEACHER_RECORDS) {
  const headers = [
    'التاريخ الهجري',
    'اليوم',
    'اسم المعلم',
    'وقت الحضور',
    'الغياب',
    'التأخير',
    'وقت الانصراف',
    'التوقيع',
  ];

  const colWidths = [
    convertInchesToTwip(1.1),
    convertInchesToTwip(0.8),
    convertInchesToTwip(1.3),
    convertInchesToTwip(0.7),
    convertInchesToTwip(0.5),
    convertInchesToTwip(0.5),
    convertInchesToTwip(0.8),
    convertInchesToTwip(0.8),
  ];

  // Info card table (2x2)
  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  new TextRun({ text: 'المشرف العام: ', bold: true, color: '1E3A5F', font: 'Arial', size: 20 }),
                  new TextRun({ text: 'أحمد محمد', color: '334155', font: 'Arial', size: 20 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  new TextRun({ text: 'المدير والمؤسس: ', bold: true, color: '1E3A5F', font: 'Arial', size: 20 }),
                  new TextRun({ text: 'أستاذ علي محمد ثاني', color: '334155', font: 'Arial', size: 20 }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  new TextRun({ text: 'الفترة: ', bold: true, color: '1E3A5F', font: 'Arial', size: 20 }),
                  new TextRun({ text: 'شهر ربيع الثاني ١٤٤٨ هـ', color: '334155', font: 'Arial', size: 20 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  new TextRun({ text: 'أوقات الدوام الصباحي: ', bold: true, color: '1E3A5F', font: 'Arial', size: 20 }),
                  new TextRun({ text: '٣:٢٠ - ٤:٠٠', color: '334155', font: 'Arial', size: 20 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Table Header Row
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((hText, i) => {
      return new TableCell({
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: '1E3A5F', type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: '1E3A5F' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: '1E3A5F' },
          left: { style: BorderStyle.SINGLE, size: 4, color: '1E3A5F' },
          right: { style: BorderStyle.SINGLE, size: 4, color: '1E3A5F' },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            children: [
              new TextRun({
                text: hText,
                bold: true,
                color: 'FFFFFF',
                font: 'Arial',
                size: 20,
              }),
            ],
          }),
        ],
      });
    }),
  });

  // Main data rows
  const dataRows = records.map((record, rIdx) => {
    const fillHex = rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';
    const rowValues = [
      record.hijriDate,
      record.day,
      record.teacherName,
      record.checkInTime,
      record.absence,
      record.delay,
      record.checkOutTime,
      record.signature,
    ];

    return new TableRow({
      children: rowValues.map((val, cIdx) => {
        const isTeacherName = cIdx === 2;
        return new TableCell({
          width: { size: colWidths[cIdx], type: WidthType.DXA },
          shading: { fill: fillHex, type: ShadingType.CLEAR },
          verticalAlign: VerticalAlign.CENTER,
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
            left: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
            right: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          },
          children: [
            new Paragraph({
              alignment: isTeacherName ? AlignmentType.RIGHT : AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: val || '',
                  bold: isTeacherName,
                  color: '1E293B',
                  font: 'Arial',
                  size: 19,
                }),
              ],
            }),
          ],
        });
      }),
    });
  });

  const mainTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: [headerRow, ...dataRows],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertInchesToTwip(8.27),
              height: convertInchesToTwip(11.69),
            },
            margin: {
              top: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            children: [
              new TextRun({
                text: 'مركز تاج الوقار لعلوم القرآن والآثار',
                font: 'Arial',
                size: 44, // 22pt
                bold: true,
                color: '1E3A5F',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: 'سجل متابعة المعلمين – شهر ربيع الثاني ١٤٤٨ هـ',
                font: 'Arial',
                size: 28, // 14pt
                bold: true,
                color: '0D9488',
              }),
            ],
          }),
          infoTable,
          new Paragraph({ spacing: { after: 200 } }),
          mainTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'Teacher_Attendance_Record.docx');
}
