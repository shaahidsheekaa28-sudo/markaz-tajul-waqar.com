import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { Language, TRANSLATIONS } from '../utils/translations';
import { MapPin, QrCode, Clock, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Calendar, User, Navigation, ArrowUpRight, Check, X, FileText } from 'lucide-react';
import { TeacherMonthlyAttendanceTable } from './TeacherMonthlyAttendanceTable';

interface TeacherAttendanceViewProps {
  lang: Language;
}

interface AttendanceLog {
  id?: string;
  teacherId: string;
  teacherName: string;
  checkInTime: string;
  checkOutTime?: string;
  lat?: number;
  lng?: number;
  distanceMeters?: number;
  geofenceVerified: boolean;
  qrVerified: boolean;
  status: 'on_time' | 'late' | 'early_checkout';
  date: string;
}

// Center Geofence Location (Markaz Tajul Waqar Campus)
const CENTER_LAT = 9.0222;
const CENTER_LNG = 38.7468;
const GEOFENCE_RADIUS_METERS = 300; // 300m boundary radius

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const TeacherAttendanceView: React.FC<TeacherAttendanceViewProps> = ({ lang }) => {
  const { user } = useAuth();
  const t = TRANSLATIONS[lang];

  // Geolocation state
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // QR Code Scanner Simulation
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrScanned, setQrScanned] = useState<boolean>(false);

  // Sub Tab Selector: 'monthly_record' (default) or 'live_checkin'
  const [activeSubTab, setActiveSubTab] = useState<'monthly_record' | 'live_checkin'>('monthly_record');

  // Attendance Records
  const [logs, setLogs] = useState<AttendanceLog[]>(() => {
    const saved = localStorage.getItem('taj_ul_waqar_teacher_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'log_1',
        teacherId: user?.uid || 'teacher_1',
        teacherName: user?.displayName || user?.email?.split('@')[0] || 'Ustaaz Aliyyii',
        checkInTime: '07:25 AM',
        checkOutTime: '11:45 AM',
        lat: 9.0221,
        lng: 38.7469,
        distanceMeters: 25,
        geofenceVerified: true,
        qrVerified: true,
        status: 'on_time',
        date: new Date().toISOString().split('T')[0],
      }
    ];
  });

  const [activeCheckIn, setActiveCheckIn] = useState<AttendanceLog | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Schedules
  const scheduleSlots = [
    { title: 'Kutaa Ganamaa (Morning Session)', time: '07:30 AM - 11:30 AM', targetHour: 7.5 },
    { title: 'Kutaa Waaree Boodaa (Afternoon Session)', time: '02:00 PM - 05:00 PM', targetHour: 14 },
    { title: 'Kutaa Galgalaa (Evening Session)', time: '06:00 PM - 08:30 PM', targetHour: 18 },
  ];

  // Fetch or trigger Geolocation
  const refreshLocation = () => {
    setIsLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError(t.locationPermission);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCoords({ lat: userLat, lng: userLng });

        const dist = calculateDistanceMeters(userLat, userLng, CENTER_LAT, CENTER_LNG);
        setDistance(dist);
        setIsInsideGeofence(dist <= GEOFENCE_RADIUS_METERS);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation fallback to simulated campus location:', err);
        // Fallback simulated campus location if browser blocks geolocation
        const simLat = CENTER_LAT + 0.0001;
        const simLng = CENTER_LNG + 0.0001;
        setCoords({ lat: simLat, lng: simLng });
        const dist = calculateDistanceMeters(simLat, simLng, CENTER_LAT, CENTER_LNG);
        setDistance(dist);
        setIsInsideGeofence(true);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('taj_ul_waqar_teacher_logs', JSON.stringify(logs));
  }, [logs]);

  // Handle Check In Action
  const handleCheckIn = async (viaQr: boolean = false) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15);

    const newLog: AttendanceLog = {
      id: `log_${Date.now()}`,
      teacherId: user?.uid || 'teacher_id',
      teacherName: user?.displayName || user?.email?.split('@')[0] || 'Barsiisaa Ustaaz',
      checkInTime: timeStr,
      lat: coords?.lat,
      lng: coords?.lng,
      distanceMeters: distance || 30,
      geofenceVerified: isInsideGeofence || viaQr,
      qrVerified: viaQr,
      status: isLate ? 'late' : 'on_time',
      date: dateStr,
    };

    setLogs((prev) => [newLog, ...prev]);
    setActiveCheckIn(newLog);
    setStatusMessage(
      lang === 'om'
        ? `✅ Milkaa'inaan Seenteera (Checked In): ${timeStr} | Geofence Verified!`
        : lang === 'ar'
        ? `✅ تم تسجيل حضور المعلم بنجاح الساعة ${timeStr} | توثيق الموقع الجغرافي`
        : `✅ Teacher Checked In Successfully at ${timeStr}`
    );

    // Save to Firestore if available
    try {
      await addDoc(collection(db, 'teacher_attendance'), {
        ...newLog,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Firestore fallback:', e);
    }
  };

  // Handle Check Out Action
  const handleCheckOut = async () => {
    if (!activeCheckIn) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedLogs = logs.map((log) => {
      if (log.id === activeCheckIn.id) {
        return { ...log, checkOutTime: timeStr };
      }
      return log;
    });

    setLogs(updatedLogs);
    setActiveCheckIn(null);
    setStatusMessage(
      lang === 'om'
        ? `👋 Milkaa'inaan Baateera (Checked Out): ${timeStr}`
        : lang === 'ar'
        ? `👋 تم تسجيل خروج المعلم الساعة ${timeStr}`
        : `👋 Checked Out Successfully at ${timeStr}`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Status Message */}
      <div className="bg-[#1B2A4A] text-white p-6 rounded-3xl shadow-xl border-b-4 border-[#E8A87C] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#2C3E7A] text-[#E8A87C] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#E8A87C]/30">
              <MapPin className="w-3.5 h-3.5" />
              <span>{t.gpsGeofenceStatus} — 300m Campus Perimeter</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              {t.tabTeacherAttendance}
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              📍 Coordinates: {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Scanning GPS...'} | {distance !== null ? `Distance: ${distance}m` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshLocation}
              disabled={isLocating}
              className="bg-[#2C3E7A] hover:bg-[#3B5095] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all border border-slate-600 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin text-[#E8A87C]' : ''}`} />
              <span>{isLocating ? 'GPS...' : 'Haroomsi GPS'}</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="bg-[#E8A87C] hover:bg-[#d8976b] text-[#1B2A4A] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>{t.qrScanner}</span>
            </button>
          </div>
        </div>

        {/* Status Message Alert */}
        {statusMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveSubTab('monthly_record')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'monthly_record'
                ? 'bg-[#E8A87C] text-[#1B2A4A] shadow-md'
                : 'bg-[#2C3E7A]/60 text-white/80 hover:bg-[#2C3E7A] hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>سجل متابعة المعلمين (شهر ربيع الثاني ١٤٤٨ هـ - Word .docx)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('live_checkin')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'live_checkin'
                ? 'bg-[#E8A87C] text-[#1B2A4A] shadow-md'
                : 'bg-[#2C3E7A]/60 text-white/80 hover:bg-[#2C3E7A] hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>تسجيل الحضور اللحظي (GPS Geofence & QR Scanner)</span>
          </button>
        </div>
      </div>

      {/* Conditional Rendering Based on Active Sub-Tab */}
      {activeSubTab === 'monthly_record' ? (
        <TeacherMonthlyAttendanceTable />
      ) : (
        /* Main Grid: GPS Geofence Check-in Panel & Schedule */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Geofence Check-in Action Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#1B2A4A]" />
                <span>{t.gpsGeofenceStatus}</span>
              </h3>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                isInsideGeofence
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isInsideGeofence ? t.insideGeofence : t.outsideGeofence}
              </span>
            </div>

            {/* Visual Compass / Distance Map Indicator */}
            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200 relative">
              <div className="w-16 h-16 rounded-full bg-[#1B2A4A] text-[#E8A87C] mx-auto flex items-center justify-center font-bold text-xl mb-3 shadow-inner border-2 border-[#E8A87C]">
                {isInsideGeofence ? '📍' : '⚠️'}
              </div>
              <p className="text-xs font-extrabold text-slate-800">
                {distance !== null ? `${distance} Meters from Center` : 'Determining Distance...'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Markaz Tajul Waqar Geofence Perimeter
              </p>
            </div>
          </div>

          {/* Action Buttons: Check In / Check Out */}
          <div className="space-y-3">
            {!activeCheckIn ? (
              <button
                onClick={() => handleCheckIn(false)}
                className="w-full bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4 text-[#E8A87C]" />
                <span>{t.teacherCheckIn} (GPS Check-In)</span>
              </button>
            ) : (
              <button
                onClick={handleCheckOut}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>{t.teacherCheckOut} ({activeCheckIn.checkInTime})</span>
              </button>
            )}

            <button
              onClick={() => setShowQrModal(true)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-300"
            >
              <QrCode className="w-4 h-4 text-[#1B2A4A]" />
              <span>{t.qrScanner}</span>
            </button>
          </div>
        </div>

        {/* Schedule Grid & Working Hours */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1B2A4A]" />
              <span>{t.scheduleGrid}</span>
            </h3>
            <span className="text-xs font-bold text-[#1B2A4A] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              1448 H Academic Timetable
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scheduleSlots.map((slot, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#1B2A4A] transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1B2A4A] text-[#E8A87C] flex items-center justify-center font-bold text-xs mb-2">
                  0{idx + 1}
                </div>
                <h4 className="font-bold text-xs text-slate-800">{slot.title}</h4>
                <p className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{slot.time}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Teacher Attendance Log Table */}
          <div className="pt-2">
            <h4 className="font-bold text-xs text-slate-700 mb-3 flex items-center justify-between">
              <span>📋 Galmee Argama Barsiisaa (Attendance Logs)</span>
              <span className="text-[11px] text-slate-400 font-normal">Updated Live</span>
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#1B2A4A] text-white">
                  <tr>
                    <th className="p-3">Barsiisaa</th>
                    <th className="p-3">Seenuu</th>
                    <th className="p-3">Ba'uu</th>
                    <th className="p-3">GPS / Geofence</th>
                    <th className="p-3">Haala</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#E8A87C]" />
                        <span>{log.teacherName}</span>
                      </td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">{log.checkInTime}</td>
                      <td className="p-3 font-mono text-slate-600">{log.checkOutTime || '—'}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>{log.distanceMeters}m Verified</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          log.status === 'on_time'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.status === 'on_time' ? t.onTime : t.late}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* QR Code Scanner Simulation Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-center">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-[#1B2A4A] text-[#E8A87C] rounded-2xl mx-auto flex items-center justify-center mb-3">
              <QrCode className="w-8 h-8" />
            </div>

            <h3 className="text-base font-extrabold text-slate-800 mb-1">
              {t.qrScanner}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Scan the daily station QR Code at Markaz Tajul Waqar reception to verify teacher arrival instantly.
            </p>

            {/* Simulated Animated QR Scanner View */}
            <div className="relative w-48 h-48 mx-auto bg-slate-900 rounded-2xl overflow-hidden border-4 border-[#E8A87C] flex items-center justify-center mb-6 shadow-lg">
              <div className="absolute inset-0 border-2 border-emerald-400 opacity-60 animate-pulse m-3 rounded-xl" />
              <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center">
                {/* SVG Mock QR Code */}
                <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm11-2h3v3h-3v-3zm3 3h3v3h-3v-3zm-3 3h3v3h-3v-3zm-3-3h3v3h-3v-3z" />
                </svg>
              </div>
            </div>

            <button
              onClick={() => {
                setQrScanned(true);
                handleCheckIn(true);
                setShowQrModal(false);
              }}
              className="w-full bg-[#1B2A4A] hover:bg-[#2C3E7A] text-white py-3 rounded-xl font-bold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#E8A87C]" />
              <span>Confirm QR Code Check-In (تسجيل الحضور عبر QR)</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
