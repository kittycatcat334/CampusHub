import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { User, UserRole } from '../../types';
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
  Sparkles,
  School,
  KeyRound,
  Wrench,
  ShieldAlert,
  Building2,
  ChevronDown,
  LogIn
} from 'lucide-react';
import { BuilderSVCodeModal } from './BuilderSVCodeModal';
import { InstitutionsManagerModal } from '../admin/InstitutionsManagerModal';

export const LoginScreen: React.FC = () => {
  const {
    login,
    loginAsUser,
    createCustomAccount,
    verifyStaffCode,
    staffVerificationCode,
    institutions,
    currentInstitution,
    switchInstitution
  } = useAuth();

  // Active portal tab: 'student' or 'teacher'
  const [activePortal, setActivePortal] = useState<UserRole>('student');
  const [isInstitutionsModalOpen, setIsInstitutionsModalOpen] = useState(false);
  const [isInstDropdownOpen, setIsInstDropdownOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState('a.rivera@university.edu');
  const [password, setPassword] = useState('student123');
  const [svCode, setSvCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Builder SV-Code modal state
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);

  // Registration modal/section
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSvCode, setRegSvCode] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science');

  const allUsers = db.getUsers();
  const studentDemoUsers = allUsers.filter(u => u.role === 'student');
  const teacherDemoUsers = allUsers.filter(u => u.role === 'teacher');
  const principalDemoUsers = allUsers.filter(u => u.role === 'principal');
  const adminDemoUsers = allUsers.filter(u => u.role === 'admin');

  const handlePortalSwitch = (role: UserRole) => {
    setActivePortal(role);
    setError(null);
    if (role === 'student') {
      setEmail(studentDemoUsers[0]?.email || 'a.rivera@university.edu');
      setPassword(studentDemoUsers[0]?.password || 'student123');
      setSvCode('');
    } else if (role === 'teacher') {
      setEmail(teacherDemoUsers[0]?.email || 'r.chen@university.edu');
      setPassword(teacherDemoUsers[0]?.password || 'faculty123');
      // Initialize with teacher verification code 6565
      setSvCode(staffVerificationCode || '6565');
    } else if (role === 'principal') {
      setEmail(principalDemoUsers[0]?.email || `principal@${currentInstitution.domain}`);
      setPassword(principalDemoUsers[0]?.password || 'principal123');
      setSvCode('');
    } else if (role === 'admin') {
      setEmail(adminDemoUsers[0]?.email || 'admin@campushub.edu');
      setPassword(adminDemoUsers[0]?.password || 'admin');
      setSvCode('');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your university email and password.');
      return;
    }

    if (activePortal === 'teacher' && !svCode.trim()) {
      setError('Teacher verification code is required. Please enter code 6565.');
      return;
    }

    setLoading(true);
    // Simulate brief secure handshake
    setTimeout(() => {
      const res = login(email, password, activePortal, activePortal === 'teacher' ? svCode.trim() : undefined);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Invalid credentials or portal selection.');
      }
    }, 300);
  };

  const handleQuickLogin = (user: User) => {
    setError(null);
    setActivePortal(user.role);
    setEmail(user.email);
    setPassword(user.password || (user.role === 'teacher' ? 'faculty123' : 'student123'));
    if (user.role === 'teacher') {
      setSvCode(staffVerificationCode || '6565');
    }
    loginAsUser(user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (activePortal === 'teacher') {
      const code = regSvCode.trim();
      if (!code) {
        setError('Teacher verification code is required. Teachers must enter code 6565.');
        return;
      }
      if (code !== '6565' && !verifyStaffCode(code)) {
        setError('Invalid teacher code. Teachers must enter code 6565 to create an account.');
        return;
      }
    }

    const res = createCustomAccount(regName, regEmail, activePortal, regDepartment, regPassword, regSvCode);
    if (res && !res.success) {
      setError(res.error || 'Registration failed.');
      return;
    }
    setIsRegistering(false);
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
                Single Sign-On for Students, Faculty & Course Instruction
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
                title="Switch active university or client institution"
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
                    <button
                      id="btn-login-manage-institutions-link"
                      onClick={() => {
                        setIsInstitutionsModalOpen(true);
                        setIsInstDropdownOpen(false);
                      }}
                      className="text-[10px] text-emerald-400 hover:underline font-bold"
                    >
                      + Add / Sell New
                    </button>
                  </div>

                  <div className="py-1 max-h-60 overflow-y-auto">
                    {institutions.map(inst => (
                      <button
                        key={inst.id}
                        type="button"
                        onClick={() => {
                          switchInstitution(inst.id);
                          setIsInstDropdownOpen(false);
                          const targetUsers = db.getUsers(inst.id);
                          const students = targetUsers.filter(u => u.role === 'student');
                          const teachers = targetUsers.filter(u => u.role === 'teacher');
                          const admins = targetUsers.filter(u => u.role === 'admin');
                          if (activePortal === 'student') {
                            setEmail(students[0]?.email || `student@${inst.domain}`);
                            setPassword(students[0]?.password || 'student123');
                          } else if (activePortal === 'teacher') {
                            setEmail(teachers[0]?.email || `faculty@${inst.domain}`);
                            setPassword(teachers[0]?.password || 'faculty123');
                            setSvCode(inst.staffVerificationCode);
                          } else if (activePortal === 'admin') {
                            setEmail(admins[0]?.email || inst.contactAdminEmail);
                            setPassword(admins[0]?.password || 'admin');
                          }
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

                  <div className="p-2 border-t border-slate-700/80">
                    <button
                      type="button"
                      onClick={() => {
                        setIsInstitutionsModalOpen(true);
                        setIsInstDropdownOpen(false);
                      }}
                      className="w-full text-center py-1.5 px-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Onboard New Institution</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              id="btn-login-open-institutions"
              type="button"
              onClick={() => setIsInstitutionsModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-xs"
              title="Commercial Multi-Tenancy: Manage client universities & institutions"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Client Campuses ({institutions.length})</span>
            </button>

            <button
              id="btn-builder-header-svcode"
              type="button"
              onClick={() => setIsBuilderModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-xs"
              title="Webapp Builder Setup: View and configure Staff Verification Code"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden md:inline">Builder: SV-Code</span>
              <span className="md:hidden">SV-Code</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Screen Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">
            {/* Top Primary Mode Toggle: Sign In vs Create Account */}
            <div className="flex p-1 bg-slate-900/90 rounded-2xl border border-slate-700/80 mb-5">
              <button
                type="button"
                id="btn-mode-signin"
                onClick={() => { setIsRegistering(false); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  !isRegistering
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                id="btn-mode-register"
                onClick={() => {
                  setIsRegistering(true);
                  setError(null);
                  if (activePortal !== 'student' && activePortal !== 'teacher') {
                    setActivePortal('student');
                  }
                  if (!regSvCode) setRegSvCode('6565');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isRegistering
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Portal Switcher Tabs or Account Type Selector */}
            {!isRegistering ? (
              /* Quad Portal Switcher Tabs: Student, Faculty, Principal, Admin */
              <div className="flex p-1 bg-slate-900/80 rounded-2xl border border-slate-700/60 mb-6">
                <button
                  type="button"
                  id="tab-portal-student"
                  onClick={() => handlePortalSwitch('student')}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePortal === 'student'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  id="tab-portal-teacher"
                  onClick={() => handlePortalSwitch('teacher')}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePortal === 'teacher'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Faculty</span>
                </button>

                <button
                  type="button"
                  id="tab-portal-principal"
                  onClick={() => handlePortalSwitch('principal')}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePortal === 'principal'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <School className="w-3.5 h-3.5" />
                  <span>Principal</span>
                </button>

                <button
                  type="button"
                  id="tab-portal-admin"
                  onClick={() => handlePortalSwitch('admin')}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePortal === 'admin'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                  <span>Admin</span>
                </button>
              </div>
            ) : (
              /* Account Type Picker for Registration: Student vs Teacher */
              <div className="mb-5 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Register as:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setActivePortal('student'); setError(null); }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      activePortal === 'student'
                        ? 'border-indigo-500 bg-indigo-600/30 text-white ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-600/20'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                    <span className="text-xs font-bold block">Student</span>
                    <span className="text-[10px] text-emerald-400 font-medium">No code needed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePortal('teacher');
                      setError(null);
                      if (!regSvCode) setRegSvCode('6565');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      activePortal === 'teacher'
                        ? 'border-purple-500 bg-purple-600/30 text-white ring-2 ring-purple-500/40 shadow-lg shadow-purple-600/20'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <span className="text-xs font-bold block">Teacher / Faculty</span>
                    <span className="text-[10px] text-amber-400 font-bold">Code: 6565</span>
                  </button>
                </div>
              </div>
            )}

            {/* Active Institution Badge */}
            <div className="mb-4 flex items-center justify-between bg-slate-900/60 p-2.5 rounded-2xl border border-slate-700/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                  currentInstitution.brandColor === 'emerald' ? 'bg-emerald-600' :
                  currentInstitution.brandColor === 'purple' ? 'bg-purple-600' :
                  currentInstitution.brandColor === 'rose' ? 'bg-rose-600' :
                  currentInstitution.brandColor === 'amber' ? 'bg-amber-600' :
                  currentInstitution.brandColor === 'blue' ? 'bg-blue-600' :
                  'bg-indigo-600'
                }`}>
                  {currentInstitution.logoText || currentInstitution.code}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">{currentInstitution.name}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{currentInstitution.domain}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsInstitutionsModalOpen(true)}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors whitespace-nowrap ml-2"
              >
                Switch Campus
              </button>
            </div>

            {/* Portal Heading */}
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
                {activePortal === 'student'
                  ? 'Student Portal Sign In'
                  : activePortal === 'teacher'
                  ? 'Faculty Instruction Login'
                  : activePortal === 'principal'
                  ? 'Principal Control Gateway'
                  : 'Master Administrator Control'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {activePortal === 'student'
                  ? 'Access your enrolled courses, daily schedule, and urgent deliverables'
                  : activePortal === 'teacher'
                  ? 'Manage course sections, schedule assignments & projects, and grade submissions'
                  : activePortal === 'principal'
                  ? 'Autonomous management of campus schedules, timetables, classrooms, and institutional data'
                  : 'Full system oversight: setup classrooms, manage courses, user accounts, and security'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <p className="font-semibold">{error}</p>
                </div>
              </div>
            )}

            {!isRegistering ? (
              /* Regular Login Form */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {activePortal === 'student'
                      ? 'Student University Email'
                      : activePortal === 'teacher'
                      ? 'Faculty Academic Email'
                      : activePortal === 'principal'
                      ? 'Principal Executive Email'
                      : 'Administrator University Email'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        activePortal === 'student'
                          ? 'a.rivera@university.edu'
                          : activePortal === 'teacher'
                          ? 'r.chen@university.edu'
                          : activePortal === 'principal'
                          ? `principal@${currentInstitution.domain}`
                          : 'admin@campushub.edu'
                      }
                      className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (Demo: {activePortal === 'student' ? 'student123' : activePortal === 'teacher' ? 'faculty123' : 'admin'})
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
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

                {/* Teacher Verification Code - Teacher Portal Exclusive */}
                {activePortal === 'teacher' && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 animate-in fade-in duration-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Teacher Verification Code (Code: 6565) *</span>
                      </label>
                      <button
                        type="button"
                        id="btn-open-builder-svcode"
                        onClick={() => setIsBuilderModalOpen(true)}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1 transition-colors"
                        title="Webapp Builder: Click to view or change this code"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Builder Setup</span>
                      </button>
                    </div>

                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-amber-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-login-svcode"
                        type="text"
                        required
                        value={svCode}
                        onChange={(e) => setSvCode(e.target.value.toUpperCase())}
                        placeholder="6565"
                        className="w-full text-xs font-mono font-bold tracking-wider pl-9 pr-20 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setSvCode('6565')}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all"
                        title="Quick-fill teacher code 6565"
                      >
                        Fill 6565
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span className="text-amber-300/80 font-medium">Teachers require code 6565</span>
                      <span className="font-mono text-slate-400">Teacher Code: <strong className="text-amber-300">6565</strong></span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <span>Remember on this device</span>
                  </label>
                  <span className="text-indigo-400 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white shadow-lg transition-all ${
                    activePortal === 'student'
                      ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                      : activePortal === 'teacher'
                      ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/25'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                  } disabled:opacity-50 cursor-pointer`}
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {activePortal === 'student'
                          ? 'Sign In to Student Dashboard'
                          : activePortal === 'teacher'
                          ? 'Sign In to Faculty Dashboard'
                          : 'Sign In to Admin Control Center'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* New Account Registration Form */
              <form onSubmit={handleRegister} className="space-y-3">
                {activePortal === 'student' ? (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Creating new <strong>Student Account</strong>. No verification code required.</span>
                  </div>
                ) : (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-200 mb-2 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Creating new <strong>Teacher / Faculty Account</strong>. Code <strong>6565</strong> required.</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={activePortal === 'student' ? 'e.g. Jordan Hayes' : 'e.g. Prof. Arthur Vance'}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">University Email</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={activePortal === 'student' ? 'student@university.edu' : 'faculty@university.edu'}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Department / Major</label>
                  <input
                    type="text"
                    required
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* SV-Code for Teacher Registration */}
                {activePortal === 'teacher' && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Teacher Verification Code (Code: 6565) *</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsBuilderModalOpen(true)}
                        className="text-[10px] text-amber-400 hover:underline font-semibold"
                      >
                        Code Info
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={regSvCode}
                        onChange={(e) => setRegSvCode(e.target.value.toUpperCase())}
                        placeholder="6565"
                        className="w-full text-xs font-mono font-bold tracking-wider pl-3 pr-20 py-2 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setRegSvCode('6565')}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                      >
                        Fill 6565
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-300">Teachers must enter <strong>6565</strong> to create a faculty account.</p>
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
                      activePortal === 'student'
                        ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                        : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                    }`}
                  >
                    {activePortal === 'student' ? 'Create Student Account' : 'Create Teacher Account'}
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/80" />
              </div>
              <span className="relative px-3 bg-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                1-Click Fast Demo Login
              </span>
            </div>

            {/* Quick 1-Click Demo Accounts */}
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400 font-medium">
                Select a verified university account to test instantly:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePortal === 'student'
                  ? studentDemoUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleQuickLogin(user)}
                        className="p-2.5 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/50 transition-all text-left group flex items-center gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {user.studentId || 'Student'}
                          </p>
                        </div>
                      </button>
                    ))
                  : activePortal === 'teacher'
                  ? teacherDemoUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleQuickLogin(user)}
                        className="p-2.5 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-900 hover:border-purple-500/50 transition-all text-left group flex items-center gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {user.facultyId || 'Instructor'}
                          </p>
                        </div>
                      </button>
                    ))
                  : activePortal === 'principal'
                  ? principalDemoUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        id="btn-quick-principal-login"
                        onClick={() => handleQuickLogin(user)}
                        className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-950/30 hover:bg-amber-950/60 hover:border-amber-500 transition-all text-left group flex items-center gap-2.5 sm:col-span-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                          <School className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                              {user.name}
                            </p>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-500/40">
                              Principal / Dean
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {user.email} &bull; Password: {user.password || 'principal123'}
                          </p>
                        </div>
                      </button>
                    ))
                  : adminDemoUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        id="btn-quick-admin-login"
                        onClick={() => handleQuickLogin(user)}
                        className="p-2.5 rounded-xl border border-rose-500/40 bg-rose-950/30 hover:bg-rose-950/60 hover:border-rose-500 transition-all text-left group flex items-center gap-2.5 sm:col-span-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors truncate">
                              {user.name}
                            </p>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">
                              Master Admin
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {user.email} &bull; Password: {user.password || 'admin'}
                          </p>
                        </div>
                      </button>
                    ))}
              </div>
            </div>

            {/* Toggle Registration */}
            <div className="mt-5 text-center pt-3 border-t border-slate-700/50 text-xs text-slate-400">
              {!isRegistering ? (
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create a new {activePortal} profile</span>
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
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>CampusHub Academic Infrastructure &bull; University Single Sign-On</p>
      </footer>

      {/* App Builder SV-Code Setup Modal */}
      <BuilderSVCodeModal
        isOpen={isBuilderModalOpen}
        onClose={() => setIsBuilderModalOpen(false)}
        onApplyCodeToForm={(code) => {
          setSvCode(code);
          setRegSvCode(code);
        }}
      />

      {/* Multi-Tenant Institutions Manager & Provisioning Modal */}
      <InstitutionsManagerModal
        isOpen={isInstitutionsModalOpen}
        onClose={() => setIsInstitutionsModalOpen(false)}
      />
    </div>
  );
};
