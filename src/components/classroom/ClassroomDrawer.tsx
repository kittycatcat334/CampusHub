import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import {
  Home,
  Calendar,
  CheckSquare,
  GraduationCap,
  BookOpen,
  Settings,
  ShieldAlert,
  X,
  LogOut,
  Sparkles,
  Plus
} from 'lucide-react';

interface ClassroomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onSelectView: (view: string, courseId?: string) => void;
  onOpenJoinClass: () => void;
  onOpenCreateClass: () => void;
}

export const ClassroomDrawer: React.FC<ClassroomDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  onOpenJoinClass,
  onOpenCreateClass
}) => {
  const { currentUser, isAdmin, isTeacher, isStudent, logout } = useAuth();
  if (!currentUser) return null;

  const enrolledClasses = isStudent ? db.getStudentClasses(currentUser.id) : [];
  const teachingClasses = (isTeacher || isAdmin) ? (isAdmin ? db.getClasses() : db.getTeacherClasses(currentUser.id)) : [];

  const handleNav = (view: string, courseId?: string) => {
    onSelectView(view, courseId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col font-sans transition-transform duration-200">
        {/* Header */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white font-['Space_Grotesk']">
              Campus<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-6 text-xs font-medium">
          {/* Main Navigation */}
          <div className="space-y-1">
            <button
              onClick={() => handleNav('classes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeView === 'classes'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>Classes</span>
            </button>

            <button
              onClick={() => handleNav('calendar')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeView === 'calendar'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => handleNav('todo')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeView === 'todo'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckSquare className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>To-do List</span>
            </button>
          </div>

          {/* Teaching Section (for Teachers and Admins) */}
          {(isTeacher || isAdmin) && (
            <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Teaching ({teachingClasses.length})
              </div>
              {teachingClasses.length === 0 ? (
                <div className="px-3 py-2 text-slate-400 text-[11px]">No courses yet</div>
              ) : (
                teachingClasses.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => handleNav('class-detail', cls.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors truncate"
                  >
                    <div className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {cls.code.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate leading-tight">{cls.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{cls.section}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Enrolled Section (for Students) */}
          {isStudent && (
            <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Enrolled ({enrolledClasses.length})
              </div>
              {enrolledClasses.length === 0 ? (
                <div className="px-3 py-2 text-slate-400 text-[11px]">No enrolled courses</div>
              ) : (
                enrolledClasses.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => handleNav('class-detail', cls.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors truncate"
                  >
                    <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {cls.code.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate leading-tight">{cls.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{cls.teacherName}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Admin Tools (for Admin role only) */}
          {isAdmin && (
            <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Administrator
              </div>
              <button
                onClick={() => handleNav('admin')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  activeView === 'admin'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>Admin Console</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {isStudent ? (
            <button
              onClick={() => {
                onOpenJoinClass();
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Join Class</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onOpenCreateClass();
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Class</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span>{currentUser.name}</span>
            <button
              onClick={logout}
              className="hover:text-rose-600 flex items-center gap-1 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
