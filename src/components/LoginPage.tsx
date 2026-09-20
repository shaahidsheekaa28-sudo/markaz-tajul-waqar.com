import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Phone,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  User,
  KeyRound,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Logo } from './Logo';

export const LoginPage: React.FC = () => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithTeacherPhone,
    resetPassword,
    signInAsDemoTeacher
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  // Default to phone login as per Markaz instructions
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('+251912345678');
  const [email, setEmail] = useState('shaahidsheekaa7@gmail.com');
  const [password, setPassword] = useState('password123');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSentSuccess, setResetSentSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSentSuccess(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (loginMethod === 'phone') {
          if (!phone.trim()) {
            throw new Error('Lakkofsa bilbila barsiisaa galchaa (Fakkeenya: +251912345678).');
          }
          if (!password.trim()) {
            throw new Error('Jecha iccitii markaza irraa kenname galchaa.');
          }

          // Authenticate teacher using Phone and Password from Markaz
          const result = await signInWithTeacherPhone(phone, password);
          if (!result.success) {
            setError(result.message);
          }
        } else {
          if (!email.trim()) {
            throw new Error('Email address is required.');
          }
          await signInWithEmail(email, password);
        }
      } else if (mode === 'register') {
        if (!displayName.trim()) {
          throw new Error('Please enter your full name / Maqaa guutuu galchaa.');
        }
        await signUpWithEmail(email, password, displayName);
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          throw new Error('Please enter your email to receive a password reset link.');
        }
        await resetPassword(email);
        setResetSentSuccess(`Password reset email sent to (${email}). Please check your inbox.`);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Incorrect email or password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered. You can sign in directly.');
        setMode('login');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/password sign-in is not enabled. Please use Teacher Phone Login or Google.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillTeacherPhone = (demoPhone: string, demoPassword: string = 'password123') => {
    setMode('login');
    setLoginMethod('phone');
    setPhone(demoPhone);
    setPassword(demoPassword);
    setError(null);
    setResetSentSuccess(null);
  };

  const fillAdminEmail = () => {
    setMode('login');
    setLoginMethod('email');
    setEmail('teacher@tajulwaqar.org');
    setPassword('TajulWaqar1448!');
    signInAsDemoTeacher('الأستاذ والمعلم - مركز تاج الوقار');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden font-sans">
      
      {/* Subtle ambient backdrops */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-gradient-to-b from-amber-100/20 via-orange-50/10 to-transparent pointer-events-none rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-50/30 pointer-events-none rounded-full blur-3xl" />

      <div className="w-full max-w-[440px] flex flex-col items-center relative z-10">

        {/* Official Markaz Tajul Waqar Circular Emblem Logo */}
        <div className="mb-3 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
          <Logo size="3xl" className="shadow-xl ring-4 ring-[#E8A87C]/80 ring-offset-2 ring-offset-white" showBorder={true} />
        </div>

        {/* Arabic Calligraphy Header Title */}
        <h1 className="text-2xl sm:text-[28px] md:text-[30px] font-serif font-black text-slate-900 text-center tracking-wide leading-tight dir-rtl">
          مَرْكَزُ تَاجِ الْوَقَارِ لِعُلُومِ الْقُرْءَانِ وَالآثَارِ
        </h1>

        {/* Hijri Year Subtitle */}
        <p className="text-base font-bold text-slate-800 text-center mt-1 dir-rtl">
          عام ١٤٤٨ هـ - 1448 هـ
        </p>

        {/* English Center Name Subtitle */}
        <p className="text-sm font-semibold text-slate-800 text-center mt-0.5">
          Markaz Tajul Waqar li Ulum Al-Quran wal Athar
        </p>

        {/* Center Leadership Notice */}
        <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-600 bg-slate-100/80 px-3 py-1 rounded-full border border-slate-200/60">
          <Building2 className="w-3.5 h-3.5 text-[#E67E22]" />
          <span>Hogganaa Waliigalaa: Ustaaz Aliyyii Muhammad Saanii</span>
        </div>

        {/* Card Container */}
        <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100/80 p-6 sm:p-7 mt-5 relative">
          
          {/* Top Pill Navigation Tabs */}
          <div className="flex bg-[#F1F5F9] p-1 rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setResetSentSuccess(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In (Seensa)
            </button>

            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setResetSentSuccess(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register
            </button>

            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(null); setResetSentSuccess(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mode === 'forgot'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Forgot Pass
            </button>
          </div>

          {/* If mode is login: Primary Teacher Phone vs Email Selector */}
          {mode === 'login' && (
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('phone'); setError(null); }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginMethod === 'phone'
                      ? 'bg-white text-[#E67E22] shadow-xs ring-1 ring-amber-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Bilbila Barsiisaa</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setLoginMethod('email'); setError(null); }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginMethod === 'email'
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Imeelii (Email)</span>
                </button>
              </div>

              {loginMethod === 'phone' && (
                <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-50/70 border border-amber-200/50 flex items-center justify-between text-[11px] text-amber-900 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    Ragaa Markaza Tajul Waqar
                  </span>
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    Firestore Phone Auth
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Success Message Alert */}
          {resetSentSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resetSentSuccess}</span>
            </div>
          )}

          {/* Error Message Alert (Handles unregistered phone, wrong password, or not teacher) */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold block mb-0.5">Dogoggora Seensaa (Sign-In Error):</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Maqaa Guutuu
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Ustaaz Aliyyii"
                    className="w-full bg-[#EBF2F9] focus:bg-[#E2ECF7] border border-blue-100/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all pr-10"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Input: Phone Number (for Teacher) OR Email */}
            {mode === 'login' && loginMethod === 'phone' ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Lakkofsa Bilbila Barsiisaa (Phone Number)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    users/&#123;phone&#125;
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251912345678"
                    className="w-full bg-[#F8FAFC] focus:bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#E67E22]/40 transition-all pr-10"
                  />
                  <Phone className="w-4 h-4 text-[#E67E22] absolute right-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Lakkofsa bilbilaa markaza keessatti galmeeffame fayyadamaa.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shaahidsheekaa7@gmail.com"
                    className="w-full bg-[#EBF2F9] focus:bg-[#E2ECF7] border border-blue-100/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all pr-10"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Input: Password */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    {mode === 'login' && loginMethod === 'phone'
                      ? 'Jecha Iccitii Markazaa (Password)'
                      : 'Password'}
                  </label>
                  {mode === 'login' && loginMethod === 'email' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); setResetSentSuccess(null); }}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F8FAFC] focus:bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E67E22]/40 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Main Action Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#E67E22] hover:bg-[#D35400] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin">⏳</span>
              ) : mode === 'login' ? (
                <>
                  <span>
                    {loginMethod === 'phone'
                      ? 'Seenii Koodii Barsiisaa Argadhu'
                      : 'Enter System (Sign In)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'register' ? (
                <>
                  <span>Create Account (Register)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Teacher Preset Logins (for rapid testing of teacherCode) */}
          {mode === 'login' && (
            <div className="mt-4 pt-3.5 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                <span>Galmee Barsiisota Markazaa (Quick Fill):</span>
                <span className="text-[10px] text-amber-700 font-normal">Click to test</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => fillTeacherPhone('+251912345678')}
                  className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-left font-mono text-slate-700 hover:text-amber-900 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">+251912345678</span>
                  <span className="font-bold text-[#E67E22]">TW-T01</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillTeacherPhone('+251911223344')}
                  className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-left font-mono text-slate-700 hover:text-amber-900 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">+251911223344</span>
                  <span className="font-bold text-[#E67E22]">TW-T02</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillTeacherPhone('+251922334455')}
                  className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-left font-mono text-slate-700 hover:text-amber-900 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">+251922334455</span>
                  <span className="font-bold text-[#E67E22]">TW-T03</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillTeacherPhone('+251933445566')}
                  className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-left font-mono text-slate-700 hover:text-amber-900 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">+251933445566</span>
                  <span className="font-bold text-[#E67E22]">TW-T04</span>
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">
                (Alternative Sign-In)
              </span>
            </div>
          </div>

          {/* Google Sign-In Action Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer text-xs disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Need an account footer notice */}
          <p className="text-xs text-slate-500 text-center mt-4 leading-relaxed">
            Need credentials? Contact Markaz Tajul Waqar administration.
          </p>

        </div>

      </div>
    </div>
  );
};
