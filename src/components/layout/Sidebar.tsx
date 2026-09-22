import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  CalendarDays,
  Megaphone,
  FolderArchive,
  User,
  CheckCircle2,
  Users,
  PenSquare,
  GraduationCap,
  Clock,
  ShieldAlert,
  School,
  KeyRound,
  ExternalLink,
  Building2,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenClassrooms?: () => void;
  pendingWorkCount?: number;
  unreviewedSubmissionCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenClassrooms,
  pendingWorkCount = 0,
  unreviewedSubmissionCount = 0
}) => {
  const { isTeacher, isStudent, isAdmin, isPrincipal, currentUser, currentInstitution, logout } = useAuth();

  const studentItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: pendingWorkCount > 0 ? `${pendingWorkCount} due` : undefined,
      badgeColor: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
    },
    {
      id: 'schedule',
      label: 'Daily Schedule',
      icon: Clock,
      badge: 'Today',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
    },
    {
      id: 'classes',
      label: 'My Classes',
      icon: BookOpen
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: FileCheck2,
      badge: pendingWorkCount > 0 ? pendingWorkCount : undefined,
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
    },
    {
      id: 'calendar',
      label: 'Deadlines & Calendar',
      icon: CalendarDays
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone
    },
    {
      id: 'resources',
      label: 'Class Resources',
      icon: FolderArchive
    },
    {
      id: 'profile',
      label: 'Student Profile',
      icon: User
    }
  ];

  const teacherItems = [
    {
      id: 'dashboard',
      label: 'Teacher Dashboard',
      icon: LayoutDashboard,
      badge: unreviewedSubmissionCount > 0 ? `${unreviewedSubmissionCount} to grade` : undefined,
      badgeColor: 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300'
    },
    {
      id: 'classes',
      label: 'Manage Classes',
      icon: BookOpen
    },
    {
      id: 'assignments',
      label: 'Assignments & Grading',
      icon: FileCheck2,
      badge: unreviewedSubmissionCount > 0 ? unreviewedSubmissionCount : undefined,
      badgeColor: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
    },
    {
      id: 'announcements',
      label: 'Post Announcements',
      icon: Megaphone
    },
    {
      id: 'resources',
      label: 'Course Resources',
      icon: FolderArchive
    },
    {
      id: 'profile',
      label: 'Faculty Profile',
      icon: User
    }
  ];

  const adminItems = [
    {
      id: 'dashboard',
      label: 'Admin Command',
      icon: ShieldAlert,
      badge: 'Super Admin',
      badgeColor: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
    },
    {
      id: 'institutions',
      label: 'Universities & Clients',
      icon: Building2,
      badge: 'Multi-Tenant',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
    },
    {
      id: 'classrooms',
      label: 'Setup Classrooms',
      icon: School,
      badge: 'Window',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
    },
    {
      id: 'classes',
      label: 'Course Catalog',
      icon: BookOpen
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone
    },
    {
      id: 'profile',
      label: 'Admin Profile',
      icon: User
    }
  ];

  const principalItems = [
    {
      id: 'dashboard',
      label: 'Principal Workspace',
      icon: School,
      badge: 'Principal',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
    },
    {
      id: 'classes',
      label: 'Campus Courses',
      icon: BookOpen
    },
    {
      id: 'classrooms',
      label: 'Room Timetables',
      icon: Clock
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone
    },
    {
      id: 'profile',
      label: 'Executive Profile',
      icon: User
    }
  ];

  const items = isAdmin ? adminItems : isPrincipal ? principalItems : isTeacher ? teacherItems : studentItems;

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-xs sticky top-20 flex flex-col">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>{isAdmin ? 'Administration' : isPrincipal ? 'Principal Office' : isTeacher ? 'Instructor Portal' : 'Student Workspace'}</span>
          {isAdmin && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
          {isPrincipal && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </div>

        <nav className="space-y-1 mt-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'classrooms' && onOpenClassrooms) {
                    onOpenClassrooms();
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? isAdmin
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border border-rose-200/60 dark:border-rose-800 shadow-xs'
                      : isTeacher
                      ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 border border-purple-200/60 dark:border-purple-800 shadow-xs'
                      : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 border border-indigo-200/60 dark:border-indigo-800 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${
                    isActive
                      ? isAdmin ? 'text-rose-600 dark:text-rose-400' : isTeacher ? 'text-purple-700 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Separate Classroom Setup Window CTA Button - Admin Only */}
        {isAdmin && onOpenClassrooms && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              id="btn-sidebar-setup-classrooms"
              type="button"
              onClick={onOpenClassrooms}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 text-indigo-800 dark:text-indigo-200 text-xs font-bold border border-indigo-200/80 dark:border-indigo-800/60 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <School className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Setup Classrooms</span>
              </div>
              <ExternalLink className="w-3 h-3 text-indigo-500" />
            </button>
          </div>
        )}

        {/* Quick Core Principle Card for Students */}
        {isStudent && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 px-3 py-2 text-xs bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Academic Focus
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Always check your Dashboard first to answer: <span className="font-semibold text-slate-700 dark:text-slate-300">&quot;What academic work do I need to deal with?&quot;</span>
            </p>
          </div>
        )}

        {/* User Account & Prominent Sign Out Footer */}
        {currentUser && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2.5 px-1 py-0.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
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
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                    isAdmin
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : isPrincipal
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : isTeacher
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {currentUser.role}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {currentInstitution.shortName}
                  </span>
                </div>
              </div>
            </div>

            {/* HIGH-VISIBILITY SIDEBAR LOGOUT BUTTON */}
            <button
              id="btn-sidebar-logout"
              type="button"
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50/90 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-900/60 transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
              title="Sign out of CampusHub session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 transition-transform group-hover:-translate-x-0.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
