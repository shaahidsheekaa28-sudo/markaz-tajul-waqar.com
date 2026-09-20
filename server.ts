import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PYTHON_SCRIPT_CONTENT = `import pandas as pd
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
    'accent_light': 'F4D03F', # Golden Yellow
    'success': '27AE60',      # Emerald Green
    'info': '3498DB',         # Sky Blue
    'warning': 'F39C12',      # Orange
    'danger': 'E74C3C',       # Red
    'light': 'F8F9FA',        # Light Gray
    'dark': '2C3E50',         # Dark Blue
    'white': 'FFFFFF',        # White
    'gray': '95A5A6',         # Gray
    'light_gray': 'ECF0F1',   # Light Gray
    'weekend': 'F0E6E6',      # Light Red for weekends
    'study': 'E8F0FE',        # Light Blue for study days
    'header_bg': '1B2A4A',    # Dark Navy for headers
    'subheader_bg': '2C3E7A', # Royal Blue for subheaders
    'student_row': 'F7F9FC',  # Very light blue for student rows
    'alternate_row': 'EDF2F7' # Light gray-blue for alternate rows
}

# Groups Configuration
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

# Islamic Months
HIJRI_MONTHS = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
]

ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

def get_hijri_month_days(month_name, year=1448):
    month_index = HIJRI_MONTHS.index(month_name)
    month_lengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]
    is_leap_year = year % 30 in [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29]
    days = month_lengths[month_index]
    if month_index == 11 and is_leap_year:
        days = 30
    return days

def get_hijri_month_start_day(month_name, year=1448):
    base_weekday = 4  # Thursday
    days_so_far = 0
    for m in HIJRI_MONTHS[:HIJRI_MONTHS.index(month_name)]:
        days_so_far += get_hijri_month_days(m, year)
    return (base_weekday + days_so_far) % 7

def generate_hijri_month_calendar(month_name, year=1448):
    days_in_month = get_hijri_month_days(month_name, year)
    start_weekday = get_hijri_month_start_day(month_name, year)
    calendar_data = {
        'month_name': month_name, 'year': year,
        'days_in_month': days_in_month, 'start_weekday': start_weekday, 'days': []
    }
    for day in range(1, days_in_month + 1):
        weekday = (start_weekday + day - 1) % 7
        day_name = ARABIC_DAYS[weekday]
        is_weekend = weekday in [5, 6]
        calendar_data['days'].append({
            'day': day, 'weekday': day_name, 'weekday_index': weekday,
            'is_weekend': is_weekend, 'is_friday': day_name == 'الجمعة',
            'is_saturday': day_name == 'السبت', 'is_study_day': not is_weekend
        })
    return calendar_data

def get_remaining_months_1448():
    start_month = 'صفر'
    start_index = HIJRI_MONTHS.index(start_month)
    return HIJRI_MONTHS[start_index + 1:] if start_index + 1 < len(HIJRI_MONTHS) else []

print("مركز تاج الوقار لعلوم القرءان والآثار - 1448 هـ")
`;

import { teacherAuthRouter, authenticateTeacherFromMarkaz } from './teacher_portal_backend.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', center: 'Markaz Tajul Waqar' });
  });

  app.get('/api/python-script', (req, res) => {
    res.json({ script: PYTHON_SCRIPT_CONTENT });
  });

  // Mount Teacher Portal Authentication routes
  app.use('/api', teacherAuthRouter);

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
