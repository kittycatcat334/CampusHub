import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  GraduationCap,
  BookOpen,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  KeyRound,
  ShieldAlert,
  Building2,
  ChevronDown,
  LogIn,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { InstitutionsManagerModal } from '../admin/InstitutionsManagerModal';

export const LoginScreen: React.FC = () => {
  const {
    login,
    loginAdminWithCode,
    createCustomAccount,
    institutions,
    currentInstitution,
    switchInstitution,
    verifyStaffCode
  } = useAuth();

  // Active portal tab: 'student' | 'teacher' | 'admin'
  const [activePortal, setActivePortal] = useState<UserRole>('student');
  const [isInstitutionsModalOpen, setIsInstitutionsModalOpen] = useState(false);
  const [isInstDropdownOpen, setIsInstDropdownOpen] = useState(false);

  // Form states - strictly empty by default (no dummy prefill)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Registration flow states
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTeacherCode, setRegTeacherCode] = useState('');
  const [regDepartment, setRegDepartment] = useState('');

  // Email Verification modal/step state
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [resendNotification, setResendNotification] = useState<string | null>(null);

  const handlePortalSwitch = (role: UserRole) => {
    setActivePortal(role);
    setError(null);
    setEmail('');
    setPassword('');
    setTeacherCode('');
    setAdminCode('');
    setIsRegistering(false);
    setIsVerifyingEmail(false);
  };

  // Sign In submit handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ADMIN LOGIN: supports direct login via code 63166565
    if (activePortal === 'admin') {
      const codeToVerify = (adminCode || password || email).trim();
      if (!codeToVerify) {
        setError('Please enter the administrator access code (63166565).');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        const res = loginAdminWithCode(codeToVerify);
        setLoading(false);
        if (!res.success) {
          setError(res.error || 'Invalid administrator access code. Enter code 63166565.');
        }
      }, 300);
      return;
    }

    // TEACHER LOGIN: requires email, password, and code 6565
    if (activePortal === 'teacher') {
      if (!email.trim() || !password) {
        setError('Please enter your faculty academic email and password.');
        return;
      }
      const cleanCode = teacherCode.trim();
      if (!cleanCode) {
        setError('Teacher verification code is required. Please enter code 6565.');
        return;
      }
      if (cleanCode !== '6565' && !verifyStaffCode(cleanCode)) {
        setError('Invalid verification code. Teachers must enter code 6565 to sign in.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        const res = login(email.trim(), password, 'teacher', cleanCode);
        setLoading(false);
        if (!res.success) {
          setError(res.error || 'Invalid faculty credentials. Please check your email, password, and code 6565.');
        }
      }, 300);
      return;
    }

    // STUDENT LOGIN: requires email and password
    if (!email.trim() || !password) {
      setError('Please enter both your university email address and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email.trim(), password, 'student');
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Invalid student credentials. Please check your email and password.');
      }
    }, 300);
  };

  // Start registration: triggers email verification code creation
  const handleStartRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Please fill in your name, university email, and password.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (activePortal === 'teacher') {
      const code = regTeacherCode.trim();
      if (!code) {
        setError('Teacher verification code is required. Teachers must enter code 6565.');
        return;
      }
      if (code !== '6565' && !verifyStaffCode(code)) {
        setError('Invalid teacher code. Teachers must enter code 6565 to create an account.');
        return;
      }
    }

    // Generate simulated 6-digit email verification code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(generatedCode);
    setEnteredCode('');
    setVerificationError(null);
    setResendNotification(null);
    setIsVerifyingEmail(true);
  };

  // Verify email code and finalize account creation
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (enteredCode.trim() !== verificationCode.trim()) {
      setVerificationError('Incorrect verification code. Please check the 6-digit code sent to your email.');
      return;
    }

    // Code matches: create account and sign in
    const res = createCustomAccount(
      regName.trim(),
      regEmail.trim(),
      activePortal,
      regDepartment.trim() || (activePortal === 'teacher' ? 'Computer Science & Engineering' : 'Undergraduate Studies'),
      regPassword,
      activePortal === 'teacher' ? regTeacherCode.trim() : undefined,
      true // emailVerified
    );

    if (!res.success) {
      setVerificationError(res.error || 'Account creation failed. Please try again.');
      return;
    }

    // Success - user is logged in automatically by AuthContext
  };

  const handleResendCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(newCode);
    setResendNotification('A new 6-digit verification code has been dispatched to your email.');
    setVerificationError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top University Brand Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-black text-lg font-['Space_Grotesk']">
              CH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white font-['Space_Grotesk'] tracking-tight">
                  CampusHub
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  Academic Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Unified Academic Infrastructure for Students, Faculty & Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* University Switcher Dropdown */}
            <div className="relative">
              <button
                id="btn-login-campus-selector"
                type="button"
                onClick={() => setIsInstDropdownOpen(!isInstDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-white transition-all shadow-xs"
                title="Active campus institution"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold max-w-[120px] sm:max-w-[170px] truncate">{currentInstitution.shortName}</span>
                <span className="text-[10px] bg-slate-700 text-slate-300 font-mono px-1.5 py-0.2 rounded hidden sm:inline">
                  {currentInstitution.code}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isInstDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-3.5 py-2 border-b border-slate-700/80 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Select University Campus
                    </span>
                  </div>

                  <div className="py-1 max-h-60 overflow-y-auto">
                    {institutions.map(inst => (
                      <button
                        key={inst.id}
                        type="button"
                        onClick={() => {
                          switchInstitution(inst.id);
                          setIsInstDropdownOpen(false);
                          setEmail('');
                          setPassword('');
                          setTeacherCode('');
                          setAdminCode('');
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                          inst.id === currentInstitution.id
                            ? 'bg-indigo-600/30 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
                            inst.brandColor === 'emerald' ? 'bg-emerald-600' :
                            inst.brandColor === 'purple' ? 'bg-purple-600' :
                            inst.brandColor === 'rose' ? 'bg-rose-600' :
                            inst.brandColor === 'amber' ? 'bg-amber-600' :
                            inst.brandColor === 'blue' ? 'bg-blue-600' :
                            'bg-indigo-600'
                          }`}>
                            {inst.logoText || inst.code}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">{inst.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{inst.domain}</p>
                          </div>
                        </div>
                        {inst.id === currentInstitution.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Screen Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">

            {/* Portal Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-700/80 mb-5">
              <button
                type="button"
                id="tab-portal-student"
                onClick={() => handlePortalSwitch('student')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activePortal === 'student'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                id="tab-portal-teacher"
                onClick={() => handlePortalSwitch('teacher')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activePortal === 'teacher'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Teacher</span>
              </button>

              <button
                type="button"
                id="tab-portal-admin"
                onClick={() => handlePortalSwitch('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activePortal === 'admin'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Mode Switcher: Sign In vs Create Account (only available for Student & Teacher) */}
            {activePortal !== 'admin' && !isVerifyingEmail && (
              <div className="flex p-1 bg-slate-900/60 rounded-xl border border-slate-700/60 mb-5 text-xs">
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setError(null); }}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    !isRegistering
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setError(null); }}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    isRegistering
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Create Account</span>
                </button>
              </div>
            )}

            {/* Portal Header */}
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                {isVerifyingEmail
                  ? 'Verify University Email'
                  : isRegistering
                  ? activePortal === 'student'
                    ? 'Create Student Account'
                    : 'Create Teacher Account'
                  : activePortal === 'student'
                  ? 'Student Portal Sign In'
                  : activePortal === 'teacher'
                  ? 'Faculty & Teacher Sign In'
                  : 'Administrator Portal'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isVerifyingEmail
                  ? `Enter the 6-digit verification code sent to ${regEmail}`
                  : isRegistering
                  ? activePortal === 'teacher'
                    ? 'Faculty registration requires email, password, and code 6565'
                    : 'Register with your student details and verify your email'
                  : activePortal === 'student'
                  ? 'Access your enrolled courses, daily schedule, and assignments'
                  : activePortal === 'teacher'
                  ? 'Requires email, password, and verification code 6565'
                  : 'Access full administrative controls with code 63166565'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <p className="font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            {/* VIEW 1: EMAIL VERIFICATION STEP */}
            {isVerifyingEmail ? (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                {/* Simulated Inbox Banner */}
                <div className="p-3.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                    <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>University Email Verification Code</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    We sent a verification code to <strong className="text-white">{regEmail}</strong>.
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-indigo-400/40 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">Simulated Inbox Code:</span>
                    <span className="text-base font-black font-mono tracking-widest text-indigo-300">
                      {verificationCode}
                    </span>
                  </div>
                </div>

                {resendNotification && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{resendNotification}</span>
                  </div>
                )}

                {verificationError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="font-semibold">{verificationError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-full text-center text-lg font-mono font-black tracking-widest py-3 px-4 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Email & Complete Registration</span>
                </button>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVerifyingEmail(false)}
                    className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Back to Edit Info
                  </button>
                </div>
              </form>
            ) : !isRegistering ? (
              /* VIEW 2: REGULAR SIGN IN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">

                {/* ADMIN EXCLUSIVE CODE LOGIN */}
                {activePortal === 'admin' ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                      <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                        <KeyRound className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Master Administrator Authentication</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Enter master access code <strong className="text-rose-300">63166565</strong> to authenticate as Administrator.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Administrator Access Code *
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-admin-code"
                          type="password"
                          required
                          value={adminCode}
                          onChange={(e) => setAdminCode(e.target.value)}
                          placeholder="Enter code 63166565"
                          className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-rose-500/40 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <button
                      id="btn-admin-login-submit"
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Authenticate as Administrator</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* STUDENT OR TEACHER LOGIN */
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {activePortal === 'teacher' ? 'Faculty Academic Email' : 'Student University Email'} *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-login-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={activePortal === 'teacher' ? 'professor@university.edu' : 'student@university.edu'}
                          className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-login-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Teacher Verification Code strictly required for Faculty login */}
                    {activePortal === 'teacher' && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                        <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Teacher Verification Code (Code: 6565) *</span>
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-amber-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="input-login-svcode"
                            type="text"
                            required
                            value={teacherCode}
                            onChange={(e) => setTeacherCode(e.target.value.trim())}
                            placeholder="Enter code 6565"
                            className="w-full text-xs font-mono font-bold tracking-wider pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Faculty accounts require email, password, and code <strong className="text-amber-300">6565</strong>.
                        </p>
                      </div>
                    )}

                    <button
                      id="btn-login-submit"
                      type="submit"
                      disabled={loading}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white shadow-lg transition-all ${
                        activePortal === 'teacher'
                          ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/25'
                          : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                      } disabled:opacity-50 cursor-pointer`}
                    >
                      {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>
                            {activePortal === 'teacher'
                              ? 'Sign In to Faculty Portal'
                              : 'Sign In to Student Portal'}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>
            ) : (
              /* VIEW 3: ACCOUNT REGISTRATION FORM WITH EMAIL VERIFICATION TRIGGER */
              <form onSubmit={handleStartRegistration} className="space-y-3">
                {activePortal === 'teacher' && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-200 mb-2 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Faculty registration requires teacher verification code <strong>6565</strong>.</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">University Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={activePortal === 'teacher' ? 'faculty@university.edu' : 'student@university.edu'}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Academic Department / Major</label>
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create password (min 6 characters)"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Teacher Code for Teacher Registration */}
                {activePortal === 'teacher' && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                    <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Teacher Verification Code (Code: 6565) *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regTeacherCode}
                      onChange={(e) => setRegTeacherCode(e.target.value.trim())}
                      placeholder="Enter code 6565"
                      className="w-full text-xs font-mono font-bold tracking-wider px-3 py-2 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <p className="text-[10px] text-slate-300">Teachers must enter <strong>6565</strong> to register as faculty.</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsRegistering(false); setError(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
                      activePortal === 'teacher'
                        ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                    }`}
                  >
                    Continue to Email Verification
                  </button>
                </div>
              </form>
            )}

            {/* Toggle Registration footer */}
            {activePortal !== 'admin' && !isVerifyingEmail && (
              <div className="mt-5 text-center pt-3 border-t border-slate-700/50 text-xs text-slate-400">
                {!isRegistering ? (
                  <button
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create a new {activePortal === 'teacher' ? 'teacher' : 'student'} account</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-slate-400 hover:text-slate-300 font-semibold"
                  >
                    Back to Sign In
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>CampusHub Academic Infrastructure &bull; Secure University Authentication</p>
      </footer>

      {/* Multi-Tenant Institutions Manager & Provisioning Modal */}
      <InstitutionsManagerModal
        isOpen={isInstitutionsModalOpen}
        onClose={() => setIsInstitutionsModalOpen(false)}
      />
    </div>
  );
};
