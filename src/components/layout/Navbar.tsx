import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Plus,
  ChevronDown,
  UserCheck,
  RotateCcw,
  BookOpen,
  Calendar,
  LogOut,
  Filter,
  Check,
  KeyRound,
  ShieldAlert,
  School,
  Building2
} from 'lucide-react';
import { db } from '../../services/db';
import { BuilderSVCodeModal } from '../auth/BuilderSVCodeModal';
import { InstitutionsManagerModal } from '../admin/InstitutionsManagerModal';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  onOpenJoinClass?: () => void;
  onOpenCreateClass?: () => void;
  onOpenScheduleProject?: () => void;
  onOpenClassrooms?: () => void;
  onNavigate: (tab: string) => void;
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenJoinClass,
  onOpenCreateClass,
  onOpenScheduleProject,
  onOpenClassrooms,
  onNavigate,
  selectedCourseId,
  onSelectCourse
}) => {
  const {
    currentUser,
    isTeacher,
    isStudent,
    isAdmin,
    isPrincipal,
    switchRole,
    switchUser,
    allUsers,
    logout,
    currentInstitution,
    institutions,
    switchInstitution
  } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [isBuilderSVModalOpen, setIsBuilderSVModalOpen] = useState(false);
  const [isInstitutionsModalOpen, setIsInstitutionsModalOpen] = useState(false);

  if (!currentUser) return null;

  // Get active courses for current user
  const userClasses = isStudent
    ? db.getStudentClasses(currentUser.id)
    : db.getTeacherClasses(currentUser.id);

  const selectedClass = selectedCourseId ? userClasses.find(c => c.id === selectedCourseId) : null;

  const handleResetData = () => {
    if (confirm('Reset CampusHub data to the default university semester catalog?')) {
      db.resetData();
      setShowUserMenu(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => onNavigate('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-['Space_Grotesk']">
                Campus<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isAdmin
                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : isPrincipal
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : isTeacher
                  ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}>
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">Academic Management Platform</p>
          </div>
        </div>

        {/* Center: Course Selector & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* COURSE SELECTOR DROPDOWN */}
          <div className="relative">
            <button
              id="dropdown-course-selector"
              onClick={() => setShowCourseMenu(!showCourseMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                selectedClass
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title="Select a specific course to filter dashboard"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate">
                {selectedClass ? `${selectedClass.code} - ${selectedClass.name}` : 'All Courses'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showCourseMenu && (
              <div
                className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Select Course View
                  </span>
                  {selectedCourseId && (
                    <button
                      onClick={() => {
                        onSelectCourse(null);
                        setShowCourseMenu(false);
                      }}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                {/* All Courses Option */}
                <button
                  onClick={() => {
                    onSelectCourse(null);
                    setShowCourseMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                    !selectedCourseId
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-900 dark:text-indigo-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>All Enrolled Courses</span>
                  </div>
                  {!selectedCourseId && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>

                {/* Individual Classes */}
                <div className="py-1">
                  {userClasses.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => {
                        onSelectCourse(cls.id);
                        setShowCourseMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                        selectedCourseId === cls.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-900 dark:text-indigo-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {cls.code}
                          </span>
                          <span className="truncate">{cls.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{cls.schedule}</p>
                      </div>
                      {selectedCourseId === cls.id && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* SCREEN LIGHT/DARK MODE TOGGLE */}
          <ThemeToggle variant="icon" />

          {/* SEPARATE CLASSROOM SETUP WINDOW BUTTON - ADMIN ONLY */}
          {isAdmin && onOpenClassrooms && (
            <button
              id="btn-navbar-setup-classrooms"
              onClick={onOpenClassrooms}
              className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-2xs"
              title="Open Classroom Setup Window"
            >
              <School className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden md:inline">Setup Classrooms</span>
            </button>
          )}

          {/* MULTI-CAMPUS / INSTITUTIONS BUTTON - ADMIN ONLY */}
          {isAdmin && (
            <button
              id="btn-navbar-institutions"
              onClick={() => setIsInstitutionsModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-2xs"
              title="Manage and switch between client universities or provision new ones"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline">{currentInstitution.shortName}</span>
              <span className="lg:hidden">{currentInstitution.code}</span>
            </button>
          )}

          {/* ADMIN CONTROLS BUTTON - ADMIN ONLY */}
          {isAdmin && (
            <button
              id="btn-navbar-admin-center"
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs shadow-rose-900/30"
              title="Open Admin Control Center"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Controls</span>
            </button>
          )}

          {/* TEACHER SEPARATE SCHEDULE BUTTON */}
          {isTeacher && onOpenScheduleProject && (
            <button
              id="btn-navbar-schedule-project"
              onClick={onOpenScheduleProject}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold px-3 sm:px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-purple-200 dark:shadow-purple-950"
              title="Schedule an assignment or multi-milestone term project"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Schedule Deliverable</span>
              <span className="sm:hidden">Schedule</span>
            </button>
          )}

          {/* Primary Quick CTA */}
          {isStudent && onOpenJoinClass && (
            <button
              onClick={onOpenJoinClass}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-xs shadow-indigo-200 dark:shadow-indigo-950"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Join Class</span>
              <span className="sm:hidden">Join</span>
            </button>
          )}

          {isTeacher && onOpenCreateClass && (
            <button
              onClick={onOpenCreateClass}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Course</span>
              <span className="sm:hidden">Course</span>
            </button>
          )}

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-700/80"
              aria-expanded={showUserMenu}
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[110px]">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[110px]">{currentUser.department || currentUser.email}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                    currentUser.role === 'admin'
                      ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {currentUser.role === 'admin'
                      ? 'Master Administrator (Full Access)'
                      : currentUser.role === 'teacher'
                      ? (currentUser.title || 'Faculty Instructor')
                      : `Student ID: ${currentUser.studentId}`}
                  </span>
                </div>

                {/* Appearance Theme Selector inside Menu */}
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Screen Mode</span>
                  <ThemeToggle variant="segmented" />
                </div>

                {/* Administrative Controls - Only for Admins */}
                {isAdmin && (
                  <div className="px-2 pt-1 border-b border-slate-100 dark:border-slate-800 pb-1 space-y-0.5">
                    {onOpenClassrooms && (
                      <button
                        id="btn-menu-setup-classrooms"
                        onClick={() => {
                          onOpenClassrooms();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center gap-2 font-bold"
                      >
                        <School className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Setup Classrooms
                      </button>
                    )}
                    <button
                      id="btn-menu-admin-center"
                      onClick={() => {
                        onNavigate('dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-bold"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Admin Control Center
                    </button>
                    <button
                      id="btn-nav-manage-institutions-menu"
                      onClick={() => {
                        setIsInstitutionsModalOpen(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2 font-bold"
                    >
                      <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Manage Institutions ({institutions.length})
                    </button>
                  </div>
                )}

                <div className="px-2 pt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
                  >
                    <UserCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    View & Edit Profile
                  </button>
                  <button
                    onClick={handleResetData}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-400" />
                    Reset Data to Defaults
                  </button>
                  <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      id="btn-sign-out"
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 flex items-center justify-between font-bold cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                        <span>Sign Out of Account</span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-rose-400">Exit</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DIRECT LOGOUT / SIGN OUT BUTTON (PROMINENT & HIGHLY ACCESSIBLE) */}
          <button
            id="btn-navbar-direct-logout"
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all shadow-2xs cursor-pointer hover:shadow-xs"
            title="Sign out of CampusHub immediately"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <BuilderSVCodeModal
        isOpen={isBuilderSVModalOpen}
        onClose={() => setIsBuilderSVModalOpen(false)}
      />

      <InstitutionsManagerModal
        isOpen={isInstitutionsModalOpen}
        onClose={() => setIsInstitutionsModalOpen(false)}
      />
    </header>
  );
};

