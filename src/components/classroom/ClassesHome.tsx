import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { UniversityClass } from '../../types';
import {
  BookOpen,
  Plus,
  MoreVertical,
  Folder,
  CheckSquare,
  Users,
  Copy,
  Check,
  Trash2,
  Edit3,
  UserMinus,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ClassesHomeProps {
  onSelectClass: (courseId: string) => void;
  onOpenJoinClass: () => void;
  onOpenCreateClass: () => void;
}

// Visual color themes for course banners (Google Classroom aesthetic + modern polish)
const THEME_STYLES: Record<string, { bg: string; text: string; accent: string }> = {
  indigo: {
    bg: 'from-indigo-600 via-indigo-700 to-indigo-800',
    text: 'text-indigo-100',
    accent: 'bg-indigo-500/30'
  },
  emerald: {
    bg: 'from-emerald-600 via-emerald-700 to-teal-800',
    text: 'text-emerald-100',
    accent: 'bg-emerald-500/30'
  },
  purple: {
    bg: 'from-purple-600 via-purple-700 to-indigo-800',
    text: 'text-purple-100',
    accent: 'bg-purple-500/30'
  },
  amber: {
    bg: 'from-amber-600 via-orange-600 to-amber-700',
    text: 'text-amber-100',
    accent: 'bg-amber-500/30'
  },
  rose: {
    bg: 'from-rose-600 via-pink-700 to-rose-800',
    text: 'text-rose-100',
    accent: 'bg-rose-500/30'
  },
  sky: {
    bg: 'from-sky-600 via-blue-700 to-indigo-800',
    text: 'text-sky-100',
    accent: 'bg-sky-500/30'
  }
};

export const ClassesHome: React.FC<ClassesHomeProps> = ({
  onSelectClass,
  onOpenJoinClass,
  onOpenCreateClass
}) => {
  const { currentUser, isStudent, isTeacher, isAdmin } = useAuth();
  if (!currentUser) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuCourseId, setActiveMenuCourseId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Get active courses
  const allClasses: UniversityClass[] = isStudent
    ? db.getStudentClasses(currentUser.id)
    : (isAdmin ? db.getClasses() : db.getTeacherClasses(currentUser.id));

  const classes = allClasses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePurgeData = () => {
    if (confirm('Clear all sample mock courses, assignments, and test submissions? You will have a clean slate to add your own real academic coursework.')) {
      db.clearDummyData();
    }
  };

  const handleRestoreData = () => {
    if (confirm('Load university sample courses (CS201, MATH301, BIO101, etc.) for demonstration?')) {
      db.restoreDemoData();
    }
  };

  const handleCopyCode = (code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleUnenroll = (classId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to unenroll from this course?')) {
      db.unenrollStudent(currentUser.id, classId);
      setActiveMenuCourseId(null);
    }
  };

  const handleDeleteClass = (classId: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to permanently delete course "${name}"?`)) {
      db.deleteClass(classId);
      setActiveMenuCourseId(null);
    }
  };

  const getTheme = (index: number, customColor?: string) => {
    if (customColor && THEME_STYLES[customColor]) {
      return THEME_STYLES[customColor];
    }
    const keys = Object.keys(THEME_STYLES);
    return THEME_STYLES[keys[index % keys.length]];
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Space_Grotesk']">
            {isStudent ? 'Enrolled Classes' : 'My Classes'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {classes.length} active {classes.length === 1 ? 'course' : 'courses'} &bull; Click any class to open Stream, Classwork, and Grades
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Purge / Restore Demo Controls */}
          {db.hasDummyData() && (
            <button
              onClick={handlePurgeData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold transition-all cursor-pointer"
              title="Remove sample courses to start fresh with real courses"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clean Slate (Clear Dummy Data)</span>
            </button>
          )}

          {!db.hasDummyData() && allClasses.length === 0 && (
            <button
              onClick={handleRestoreData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900/60 text-xs font-semibold transition-all cursor-pointer"
              title="Load demo classes"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load Sample Classes</span>
            </button>
          )}

          {isStudent ? (
            <button
              onClick={onOpenJoinClass}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Join Class</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenJoinClass}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
              >
                <span>Join with Code</span>
              </button>
              <button
                onClick={onOpenCreateClass}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Class</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter / Search Bar (if classes exist) */}
      {allClasses.length > 0 && (
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search classes by name, subject, or course code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-md px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      )}

      {/* Classes Cards Grid */}
      {classes.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white font-['Space_Grotesk']">
            No classes yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
            {isStudent
              ? 'Join a class using a course code from your teacher or browse the campus catalog.'
              : 'Create your first course to begin sharing announcements, assignments, and grades.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {isStudent ? (
              <button
                onClick={onOpenJoinClass}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                Join Class
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenCreateClass}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  Create Class
                </button>
                <button
                  onClick={() => db.restoreDemoData()}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                  Load Sample Classes
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, index) => {
            const theme = getTheme(index, cls.color);
            const classAssignments = db.getAssignments(cls.id);
            const pendingForStudent = isStudent
              ? classAssignments.filter(a => !db.getSubmissionForStudent(a.id, currentUser.id))
              : [];
            const nextDue = pendingForStudent[0];

            return (
              <div
                key={cls.id}
                onClick={() => onSelectClass(cls.id)}
                className="group bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Header Banner (Google Classroom styled banner) */}
                <div className={`p-5 bg-gradient-to-r ${theme.bg} text-white relative flex flex-col justify-between min-h-[120px]`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white backdrop-blur-xs">
                          {cls.code}
                        </span>
                        <span className="text-[11px] text-white/80 font-medium truncate">
                          {cls.section}
                        </span>
                      </div>
                      <h2 className="text-lg font-black tracking-tight text-white leading-snug line-clamp-2 hover:underline">
                        {cls.name}
                      </h2>
                    </div>

                    {/* 3-dots Menu */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveMenuCourseId(activeMenuCourseId === cls.id ? null : cls.id)}
                        className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuCourseId === cls.id && (
                        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-30 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={(e) => handleCopyCode(cls.joinCode, cls.id, e)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between"
                          >
                            <span>Copy join code</span>
                            {copiedCodeId === cls.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>

                          {isStudent && (
                            <button
                              onClick={(e) => handleUnenroll(cls.id, e)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-1.5"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>Unenroll</span>
                            </button>
                          )}

                          {(isTeacher || isAdmin) && (
                            <button
                              onClick={(e) => handleDeleteClass(cls.id, cls.name, e)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete class</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Teacher info inside banner */}
                  <p className="text-[11px] text-white/80 font-medium truncate mt-2">
                    {cls.teacherName}
                  </p>

                  {/* Teacher circular avatar positioned in corner */}
                  <div className="absolute -bottom-4 right-5 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800 text-slate-800 dark:text-white flex items-center justify-center font-bold text-xs shadow-md">
                    {cls.teacherName.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Card Body: Upcoming due work / schedule */}
                <div className="p-5 pt-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="min-h-[50px]">
                    {isStudent ? (
                      nextDue ? (
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Due {new Date(nextDue.dueDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {nextDue.title}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                          No work due soon
                        </p>
                      )
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {cls.enrolledStudentCount || 0} students enrolled
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {classAssignments.length} assignments &bull; Room: {cls.room}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Quick-Action Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      Code: {cls.joinCode}
                    </span>

                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
                        <span>Open class</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
