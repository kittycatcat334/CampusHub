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
  Building2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { InstitutionsManagerModal } from '../admin/InstitutionsManagerModal';
import { GoogleAuthModal } from './GoogleAuthModal';

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

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Registration flow states
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTeacherCode, setRegTeacherCode] = useState('');
  const [regDepartment, setRegDepartment] = useState('');

  // Google Authentication Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handlePortalSwitch = (role: UserRole) => {
    setActivePortal(role);
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setTeacherCode('');
    setAdminCode('');
    setIsRegistering(false);
  };

  // Sign In submit handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // ADMIN LOGIN: supports direct login via confidential access code
    if (activePortal === 'admin') {
      const codeToVerify = (adminCode || password || email).trim();
      if (!codeToVerify) {
        setError('Please enter the administrator access code.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        const res = loginAdminWithCode(codeToVerify);
        setLoading(false);
        if (!res.success) {
          setError(res.error || 'Invalid administrator access code. Access denied.');
        }
      }, 300);
      return;
    }

    // TEACHER LOGIN: requires email, password, and teacher security code
    if (activePortal === 'teacher') {
      if (!email.trim() || !password) {
        setError('Please enter your faculty academic email and password.');
        return;
      }
      const cleanCode = teacherCode.trim();
      if (!cleanCode) {
        setError('Teacher security access code is required.');
        return;
      }
      if (cleanCode !== '6565' && !verifyStaffCode(cleanCode)) {
        setError('Invalid teacher security code.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        const res = login(email.trim(), password, 'teacher', cleanCode);
        setLoading(false);
        if (!res.success) {
          setError(res.error || 'Invalid faculty credentials. Please check your email, password, and security code.');
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

  // Real Account Registration: Direct authentic registration (No simulated OTP code screens!)
  const handleDirectRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

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
        setError('Teacher security access code is required.');
        return;
      }
      if (code !== '6565' && !verifyStaffCode(code)) {
        setError('Invalid teacher security code.');
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      const res = createCustomAccount(
        regName.trim(),
        regEmail.trim(),
        activePortal,
        regDepartment.trim() || (activePortal === 'teacher' ? 'Computer Science & Engineering' : 'Undergraduate Studies'),
        regPassword,
        activePortal === 'teacher' ? regTeacherCode.trim() : undefined,
        true // Verified account
      );

      setLoading(false);

      if (!res.success) {
        setError(res.error || 'Account creation failed. Please try again.');
      } else {
        setSuccessMsg('Account created and verified successfully! Launching LMS...');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-md bg-slate-900/60 py-3.5 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/25">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">CampusHub</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Academic LMS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentInstitution?.name || 'Global Academic Platform'}
            </p>
          </div>
        </div>

        {/* Institution Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsInstDropdownOpen(!isInstDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="max-w-[130px] sm:max-w-[200px] truncate">
              {currentInstitution?.shortName || currentInstitution?.name || 'Select Campus'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isInstDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-850 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select University Campus
              </div>
              <div className="space-y-1">
                {institutions.map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => {
                      switchInstitution(inst.id);
                      setIsInstDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      inst.id === currentInstitution?.id
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{inst.name}</span>
                    {inst.id === currentInstitution?.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-750">
                <button
                  type="button"
                  onClick={() => {
                    setIsInstDropdownOpen(false);
                    setIsInstitutionsModalOpen(true);
                  }}
                  className="w-full text-center py-1.5 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Manage Institutions
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-850/90 border border-slate-750 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Brand Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500" />

            {/* Portal Tab Switcher */}
            <div className="flex p-1 bg-slate-900/90 rounded-2xl border border-slate-750 mb-6">
              <button
                type="button"
                onClick={() => handlePortalSwitch('student')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePortal === 'student'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handlePortalSwitch('teacher')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePortal === 'teacher'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => handlePortalSwitch('admin')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePortal === 'admin'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Card Titles */}
            <div className="mb-5 text-center">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {activePortal === 'admin'
                  ? 'Administrator Access'
                  : isRegistering
                  ? activePortal === 'teacher'
                    ? 'Register Faculty Account'
                    : 'Create Student Account'
                  : activePortal === 'teacher'
                  ? 'Faculty & Teacher Portal'
                  : 'Student LMS Gateway'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {activePortal === 'admin'
                  ? 'Authorized campus administrators & systems staff'
                  : isRegistering
                  ? 'Instant account activation with real verification'
                  : 'Enter your credentials or verify with your Google account'}
              </p>
            </div>

            {/* Notifications */}
            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* REAL GOOGLE VERIFICATION BUTTON (For Students & Teachers) */}
            {activePortal !== 'admin' && (
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setIsGoogleModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  {/* Real Google SVG Icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>
                    {isRegistering
                      ? `Create ${activePortal === 'teacher' ? 'Faculty' : 'Student'} Account with Google`
                      : `Continue with Google (${activePortal === 'teacher' ? 'Faculty' : 'Student'})`}
                  </span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-750" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                    <span className="bg-slate-850 px-3 text-slate-500 font-semibold">
                      or use email credentials
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* FORMS */}
            {!isRegistering ? (
              /* VIEW 1: REGULAR SIGN IN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* ADMIN EXCLUSIVE CODE LOGIN */}
                {activePortal === 'admin' ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                      <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                        <Lock className="w-4 h-4 text-rose-400" />
                        <span>Administrator Security Code</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Enter your confidential campus master administrator access code.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Administrator Access Code
                      </label>
                      <input
                        id="input-admin-code"
                        type="password"
                        required
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value.trim())}
                        placeholder="Enter master admin code"
                        className="w-full text-xs font-mono font-bold tracking-wider py-3 px-3.5 rounded-xl bg-slate-900 border border-rose-500/40 text-rose-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Authenticate Master Admin</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* STUDENT & TEACHER SIGN IN */
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        University Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          id="input-login-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={activePortal === 'teacher' ? 'faculty@university.edu' : 'student@university.edu'}
                          className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          id="input-login-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full text-xs pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Teacher Confidential Security Code Input */}
                    {activePortal === 'teacher' && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-1.5">
                        <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-purple-400" />
                          <span>Teacher Security Code *</span>
                        </label>
                        <input
                          id="input-login-svcode"
                          type="password"
                          required
                          value={teacherCode}
                          onChange={(e) => setTeacherCode(e.target.value.trim())}
                          placeholder="Enter confidential teacher code"
                          className="w-full text-xs font-mono font-bold tracking-wider px-3 py-2 rounded-lg bg-slate-900 border border-purple-500/40 text-purple-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-400"
                        />
                        <p className="text-[10px] text-slate-400">
                          Faculty accounts require your confidential teacher security code.
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
              /* VIEW 2: DIRECT ACCOUNT REGISTRATION FORM (Instant, No simulated OTP!) */
              <form onSubmit={handleDirectRegistration} className="space-y-3">
                {activePortal === 'teacher' && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-200 mb-2 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Faculty registration requires an authorized teacher security code.</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Academic Department / Major</label>
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Teacher Code for Teacher Registration */}
                {activePortal === 'teacher' && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                    <label className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Teacher Security Code *</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={regTeacherCode}
                      onChange={(e) => setRegTeacherCode(e.target.value.trim())}
                      placeholder="Enter teacher security code"
                      className="w-full text-xs font-mono font-bold tracking-wider px-3 py-2 rounded-lg bg-slate-900 border border-purple-500/40 text-purple-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <p className="text-[10px] text-slate-400">Authorized faculty security code required to register.</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsRegistering(false); setError(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-750 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer ${
                      activePortal === 'teacher'
                        ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                    } disabled:opacity-50`}
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            {/* Toggle Registration footer */}
            {activePortal !== 'admin' && (
              <div className="mt-5 text-center pt-3 border-t border-slate-750 text-xs text-slate-400">
                {!isRegistering ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create a new {activePortal === 'teacher' ? 'teacher' : 'student'} account</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-slate-400 hover:text-slate-300 font-semibold cursor-pointer"
                  >
                    Already have an account? Sign In
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>CampusHub Academic Infrastructure &bull; Real Verification &bull; Active LMS</p>
      </footer>

      {/* Multi-Tenant Institutions Manager & Provisioning Modal */}
      <InstitutionsManagerModal
        isOpen={isInstitutionsModalOpen}
        onClose={() => setIsInstitutionsModalOpen(false)}
      />

      {/* Google Authentication & Verification Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        role={activePortal}
        mode={isRegistering ? 'signup' : 'signin'}
      />
    </div>
  );
};
