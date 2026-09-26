import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  GraduationCap,
  Plus,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  Moon,
  Sun,
  BookOpen,
  Calendar,
  CheckSquare,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { UniversityClass } from '../../types';

interface ClassroomHeaderProps {
  onToggleDrawer: () => void;
  activeView: string;
  onSelectView: (view: string, courseId?: string) => void;
  activeClass: UniversityClass | null;
  classTab: 'stream' | 'classwork' | 'people' | 'grades';
  onChangeClassTab: (tab: 'stream' | 'classwork' | 'people' | 'grades') => void;
  onOpenJoinClass: () => void;
  onOpenCreateClass: () => void;
  onOpenProfile: () => void;
}

export const ClassroomHeader: React.FC<ClassroomHeaderProps> = ({
  onToggleDrawer,
  activeView,
  onSelectView,
  activeClass,
  classTab,
  onChangeClassTab,
  onOpenJoinClass,
  onOpenCreateClass,
  onOpenProfile
}) => {
  const { currentUser, isTeacher, isStudent, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Drawer toggle + Logo / Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleDrawer}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Main menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {activeClass ? (
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => onSelectView('classes')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Back to all classes"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate font-['Space_Grotesk']">
                    {activeClass.name}
                  </span>
                  <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hidden sm:inline-block">
                    {activeClass.code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                  {activeClass.section} &bull; {activeClass.teacherName}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onSelectView('classes')}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white font-['Space_Grotesk']">
                Campus<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
              </span>
            </div>
          )}
        </div>

        {/* Center: Navigation Tabs (Google Classroom 4 core tabs if inside a class, or main switcher) */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-lg">
          {activeClass ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => onChangeClassTab('stream')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  classTab === 'stream'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Stream
              </button>

              <button
                onClick={() => onChangeClassTab('classwork')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  classTab === 'classwork'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Classwork
              </button>

              <button
                onClick={() => onChangeClassTab('people')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  classTab === 'people'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                People
              </button>

              <button
                onClick={() => onChangeClassTab('grades')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  classTab === 'grades'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {isTeacher || isAdmin ? 'Grades & Reviews' : 'My Grades'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => onSelectView('classes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'classes'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Classes
              </button>
              <button
                onClick={() => onSelectView('todo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'todo'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                To-do
              </button>
              <button
                onClick={() => onSelectView('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'calendar'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Calendar
              </button>
              {isAdmin && (
                <button
                  onClick={() => onSelectView('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeView === 'admin'
                      ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Admin
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: + Action Button, Theme Toggle, Profile Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Plus button with Google Classroom style dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Create or join class"
            >
              <Plus className="w-5 h-5" />
            </button>

            {showPlusMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowPlusMenu(false)}
              >
                <button
                  onClick={onOpenJoinClass}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Join class</span>
                </button>

                {(isTeacher || isAdmin) && (
                  <button
                    onClick={onOpenCreateClass}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-purple-600" />
                    <span>Create class</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle color mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Profile Circle & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-indigo-400 transition-all cursor-pointer"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* User Info */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.email}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      onOpenProfile();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Manage Account</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        onSelectView('admin');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium flex items-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>Admin Console</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
