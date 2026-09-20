import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, LogIn, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  section: string;
  descriptionHeading: string;
  room: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode: string;
  courseState: string;
  alternateLink: string;
}

export const ClassroomView: React.FC = () => {
  const { accessToken, signInWithGoogle, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      fetchCourses();
    }
  }, [accessToken]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://classroom.googleapis.com/v1/courses', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses. Please try signing in again.');
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'An error occurred while fetching courses.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !accessToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Google Classroom Integration</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8 text-sm">
          Seenaa (Sign In) gochuun kutaalee fi barattoota keessan Google Classroom irraa kallattiin to'adhaa.
        </p>
        <button
          onClick={signInWithGoogle}
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>Sign in with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[#1B2A4A] text-white p-6 rounded-3xl shadow-xl border-b-4 border-[#E8A87C] flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#2C3E7A] text-[#E8A87C] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#E8A87C]/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Google Classroom</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Kutaalee Koo (My Courses)</h2>
          <p className="text-sm text-slate-300 mt-1">To'annoo fi hordoffii kutaalee Google Classroom.</p>
        </div>
        <button
          onClick={fetchCourses}
          disabled={loading}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/20"
        >
          Haaromsi (Refresh)
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-900 border border-red-200 rounded-2xl text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="w-10 h-10 text-[#1B2A4A] animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Kutaalee fidaa jira (Loading courses)...</p>
        </div>
      ) : courses.length === 0 && !error ? (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Kutaan Hin Argamne (No Courses Found)</h3>
          <p className="text-slate-500 text-sm mt-2">Akkauntii kana irratti kutaan Google Classroom tokkoyyuu hin jiru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white h-28 relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-lg truncate" title={course.name}>{course.name}</h3>
                  {course.section && <p className="text-blue-100 text-sm mt-1">{course.section}</p>}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1 space-y-3 mb-6">
                  {course.room && (
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="font-semibold text-slate-800">Room:</span> {course.room}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="font-semibold text-slate-800">Status:</span> 
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">
                      {course.courseState}
                    </span>
                  </p>
                </div>
                <a
                  href={course.alternateLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-slate-50 hover:bg-slate-100 text-[#1B2A4A] border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all mt-auto"
                >
                  <span>Bani (Open)</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
