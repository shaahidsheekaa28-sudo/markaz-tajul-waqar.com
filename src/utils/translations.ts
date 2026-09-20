export type Language = 'om' | 'ar' | 'en';

export interface TranslationDictionary {
  appName: string;
  subTitle: string;
  tabRegister: string;
  tabTeacherAttendance: string;
  tabNotifications: string;
  tabAnalytics: string;
  tabExports: string;
  tabPython: string;

  // Teacher Attendance
  teacherCheckIn: string;
  teacherCheckOut: string;
  gpsGeofenceStatus: string;
  insideGeofence: string;
  outsideGeofence: string;
  qrScanner: string;
  scheduleGrid: string;
  onTime: string;
  late: string;
  workingHours: string;
  locationPermission: string;

  // Student Attendance
  studentAttendance: string;
  present: string;
  absent: string;
  excused: string;
  studentSearch: string;
  attendanceRate: string;

  // Real-time Notifications
  notificationsHeader: string;
  sendSmsParent: string;
  sendSmsAdmin: string;
  absenceAlert: string;
  lateAlert: string;
  whatsappMessage: string;
  notificationHistory: string;

  // Analytics
  analyticsTitle: string;
  teacherPunctuality: string;
  studentAttendanceOverview: string;
  totalWorkingHours: string;
  groupComparison: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  om: {
    appName: "Markaz Taajul Waqaar - Hordoffii Barattootaa fi Barsiisotaa",
    subTitle: "Manoo Qur'aana fi Beeysisa Yeroo Waaltawaa - 1448 H",
    tabRegister: "📋 Hordoffii Barataa",
    tabTeacherAttendance: "📍 Hordoffii Barsiisaa (GPS/QR)",
    tabNotifications: "🔔 Beeksisa & SMS",
    tabAnalytics: "📊 Gabaasa & Xiinxala",
    tabExports: "📥 Tamsaasa Excel/PDF",
    tabPython: "🐍 Skripiti Koodii",

    teacherCheckIn: "Seenuu (Check In)",
    teacherCheckOut: "Ba'uu (Check Out)",
    gpsGeofenceStatus: "Haala To'annoo Bakkaa (Geofence)",
    insideGeofence: "Dhaabbata Keessa Jirta (On Campus)",
    outsideGeofence: "Dhaabbata Alaa Jirta (Outside Geofence)",
    qrScanner: "Koodii QR Fayyadamii Sakatta'i",
    scheduleGrid: "Giriidi Sa'aatii Barsiisotaa",
    onTime: "Sa'aatiidhaan",
    late: "Turee Seene",
    workingHours: "Sa'aatii Hojii Walii-gala",
    locationPermission: "Hayyama bakkaa (GPS) kennaa",

    studentAttendance: "Galmee Argama Barattootaa",
    present: "Jira (Present)",
    absent: "Hafe (Absent)",
    excused: "Maa'umsaa (Excused)",
    studentSearch: "Barataa barbaadi...",
    attendanceRate: "Sadarkaa Argama Barattootaa",

    notificationsHeader: "Ergaa & Beeksisa Yeroo Waaltawaa",
    sendSmsParent: "Ergaa SMS Maatiif Ergi",
    sendSmsAdmin: "Ergaa Bulchiinsaaf Ergi",
    absenceAlert: "Beeksisa Barataa Hafee",
    lateAlert: "Beeksisa Barsiisaa Turee",
    whatsappMessage: "Ergaa WhatsApp Erguu",
    notificationHistory: "Galmee Ergaawwan Ergamanii",

    analyticsTitle: "Gabaasa fi Xiinxala Bulchiinsaa",
    teacherPunctuality: "Kabaja Sa'aatii Barsiisotaa",
    studentAttendanceOverview: "Xiinxala Argama Barattootaa",
    totalWorkingHours: "Sa'aatii Hojii Barsiisaa",
    groupComparison: "Wal-simatee Halkaawwan Qur'aana",
  },
  ar: {
    appName: "مركز تاج الوقار لعلوم القرآن والآثار",
    subTitle: "نظام متابعة الطلاب وحضور المعلمين - ١٤٤٨ هـ",
    tabRegister: "📋 متابعة الطلاب",
    tabTeacherAttendance: "📍 حضور المعلمين (GPS/QR)",
    tabNotifications: "🔔 الإشعارات والرسائل",
    tabAnalytics: "📊 التقارير والإحصائيات",
    tabExports: "📥 تصدير Excel/PDF",
    tabPython: "🐍 سكريبتات Python",

    teacherCheckIn: "تسجيل الدخول (Check In)",
    teacherCheckOut: "تسجيل الخروج (Check Out)",
    gpsGeofenceStatus: "حالة النطاق الجغرافي (Geofence)",
    insideGeofence: "متواجد داخل نطاق المركز",
    outsideGeofence: "خارج نطاق المركز الجغرافي",
    qrScanner: "مسح رمز QR للحضور",
    scheduleGrid: "جدول حصص المعلمين",
    onTime: "في الوقت المحدد",
    late: "متأخر عن الحصة",
    workingHours: "إجمالي ساعات العمل",
    locationPermission: "يرجى التكرم بتفعيل خدمة الموقع GPS",

    studentAttendance: "سجل حضور وغياب الطلاب",
    present: "حاضر",
    absent: "غائب",
    excused: "مأذون",
    studentSearch: "البحث عن طالب بالاسم...",
    attendanceRate: "نسبة الحضور الإجمالية",

    notificationsHeader: "نظام الإشعارات والرسائل الفورية",
    sendSmsParent: "إرسال رسالة نصية للولي",
    sendSmsAdmin: "إشعار إدارة المركز",
    absenceAlert: "تنبيه غياب طالب",
    lateAlert: "تنبيه تأخر معلم",
    whatsappMessage: "إرسال عبر WhatsApp",
    notificationHistory: "سجل الإشعارات الموجهة",

    analyticsTitle: "لوحة التقارير والإحصائيات الشاملة",
    teacherPunctuality: "التزام المعلمين بالمواعيد",
    studentAttendanceOverview: "نظرة عامة على حضور الطلاب",
    totalWorkingHours: "ساعات عمل المعلمين",
    groupComparison: "مقارنة الحلقات القرأنية",
  },
  en: {
    appName: "Markaz Tajul Waqar - Student & Teacher Portal",
    subTitle: "Student & Teacher Attendance & Notification System - 1448 Hijri",
    tabRegister: "📋 Student Tracking",
    tabTeacherAttendance: "📍 Teacher GPS/QR Check-in",
    tabNotifications: "🔔 Alerts & SMS",
    tabAnalytics: "📊 Analytics Dashboard",
    tabExports: "📥 Export Excel/PDF",
    tabPython: "🐍 Python Tools",

    teacherCheckIn: "Check In",
    teacherCheckOut: "Check Out",
    gpsGeofenceStatus: "GPS Geofence Status",
    insideGeofence: "Inside Center Premises",
    outsideGeofence: "Outside Geofence Perimeter",
    qrScanner: "Scan QR Code",
    scheduleGrid: "Teacher Schedule Grid",
    onTime: "On Time",
    late: "Late Arrival",
    workingHours: "Total Working Hours",
    locationPermission: "Please enable GPS Location permissions",

    studentAttendance: "Student Attendance Record",
    present: "Present",
    absent: "Absent",
    excused: "Excused",
    studentSearch: "Search student name...",
    attendanceRate: "Overall Attendance Rate",

    notificationsHeader: "Real-time Notifications & Alerts",
    sendSmsParent: "Send SMS to Parent",
    sendSmsAdmin: "Notify Administration",
    absenceAlert: "Student Absence Alert",
    lateAlert: "Teacher Late Check-in Alert",
    whatsappMessage: "Send WhatsApp Alert",
    notificationHistory: "Sent Notification Logs",

    analyticsTitle: "Analytics & Admin Dashboard",
    teacherPunctuality: "Teacher Punctuality",
    studentAttendanceOverview: "Student Attendance Overview",
    totalWorkingHours: "Teacher Logged Hours",
    groupComparison: "Group Comparison Metrics",
  },
};
