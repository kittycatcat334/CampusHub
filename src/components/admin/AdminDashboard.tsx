import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { UniversityClass, User, Assignment, Announcement, Classroom } from '../../types';
import {
  ShieldAlert,
  School,
  BookOpen,
  Users,
  FileCheck2,
  Megaphone,
  KeyRound,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Lock,
  Eye,
  UserCheck,
  Calendar,
  Clock,
  Building2,
  SlidersHorizontal,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { SetupClassroomsModal } from './SetupClassroomsModal';
import { InstitutionsManagerModal } from './InstitutionsManagerModal';
import { InstitutionHandoverModal } from './InstitutionHandoverModal';
import { InstitutionDetailsView } from './InstitutionDetailsView';
import { PrincipalControlWindow } from '../principal/PrincipalControlWindow';
import { Institution } from '../../types';

interface AdminDashboardProps {
  onOpenCreateClass?: () => void;
  onOpenScheduleProject?: () => void;
  onOpenClassrooms?: () => void;
  onNavigate?: (tab: string) => void;
  initialSubTab?: 'institutions' | 'classrooms' | 'courses' | 'users' | 'assignments' | 'announcements' | 'security';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenCreateClass,
  onOpenScheduleProject,
  onOpenClassrooms,
  onNavigate,
  initialSubTab
}) => {
  const {
    currentUser,
    staffVerificationCode,
    updateStaffVerificationCode,
    switchUser,
    switchRole,
    currentInstitution,
    institutions,
    switchInstitution,
    deleteInstitution
  } = useAuth();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'institutions' | 'classrooms' | 'courses' | 'users' | 'assignments' | 'announcements' | 'security'>(initialSubTab || 'institutions');

  useEffect(() => {
    if (initialSubTab) {
      setActiveAdminSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [isClassroomWindowOpen, setIsClassroomWindowOpen] = useState(false);
  const [isInstitutionsModalOpen, setIsInstitutionsModalOpen] = useState(false);
  const [selectedHandoverInst, setSelectedHandoverInst] = useState<Institution | null>(null);
  const [selectedDetailsInstitution, setSelectedDetailsInstitution] = useState<Institution | null>(null);
  const [principalWindowInstitution, setPrincipalWindowInstitution] = useState<Institution | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New User Form State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'teacher' | 'admin'>('teacher');
  const [newUserDepartment, setNewUserDepartment] = useState('Computer Science & Engineering');
  const [newUserPassword, setNewUserPassword] = useState('password123');

  // New Course Form State
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseTeacherId, setCourseTeacherId] = useState('');
  const [courseRoom, setCourseRoom] = useState('Turing Hall 304');
  const [courseSchedule, setCourseSchedule] = useState('Mon & Wed 10:00 AM - 11:30 AM');

  // SV-Code editor state
  const [editingSVCode, setEditingSVCode] = useState(staffVerificationCode);
  const [svSuccess, setSvSuccess] = useState(false);

  // Load live data from DB
  const users = db.getUsers();
  const classes = db.getClasses();
  const classrooms = db.getClassrooms();
  const assignments = db.getAssignments();
  const submissions = db.getSubmissions();
  const announcements = db.getAnnouncements();

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  const admins = users.filter(u => u.role === 'admin');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateSVCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSVCode.trim()) return;
    updateStaffVerificationCode(editingSVCode.trim().toUpperCase());
    setSvSuccess(true);
    showToast(`Staff Verification Code updated to "${editingSVCode.trim().toUpperCase()}"`);
    setTimeout(() => setSvSuccess(false), 2500);
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('You cannot delete your active administrator account.');
      return;
    }
    if (confirm(`Permanently delete account for ${user.name} (${user.email})?`)) {
      db.deleteUser(user.id);
      showToast(`User ${user.name} removed from system.`);
    }
  };

  const handlePromoteDemoteRole = (user: User, newRole: 'student' | 'teacher' | 'admin') => {
    db.updateUserProfile(user.id, { role: newRole });
    showToast(`Changed ${user.name}'s role to ${newRole}.`);
  };

  const handleDeleteCourse = (course: UniversityClass) => {
    if (confirm(`Permanently delete course "${course.code} - ${course.name}" and remove all enrolled records?`)) {
      db.deleteClass(course.id);
      showToast(`Course ${course.code} deleted.`);
    }
  };

  const handleDeleteAssignment = (assign: Assignment) => {
    if (confirm(`Delete assignment "${assign.title}" and its submissions?`)) {
      db.deleteAssignment(assign.id);
      showToast(`Assignment "${assign.title}" deleted.`);
    }
  };

  const handleDeleteAnnouncement = (ann: Announcement) => {
    if (confirm(`Delete announcement "${ann.title}"?`)) {
      db.deleteAnnouncement(ann.id);
      showToast(`Announcement removed.`);
    }
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const created: User = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      password: newUserPassword.trim() || 'password123',
      department: newUserDepartment.trim(),
      studentId: newUserRole === 'student' ? `STU-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      facultyId: newUserRole === 'teacher' ? `FAC-ENG-${Math.floor(100 + Math.random() * 900)}` : undefined,
      title: newUserRole === 'teacher' ? 'Faculty Instructor' : newUserRole === 'admin' ? 'University Administrator' : undefined
    };

    db.createUser(created);
    showToast(`User ${created.name} created as ${created.role}!`);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;

    const teacherObj = teachers.find(t => t.id === courseTeacherId) || teachers[0];

    db.createClass({
      code: courseCode.trim().toUpperCase(),
      name: courseName.trim(),
      section: 'Section 01',
      semester: 'Fall 2026',
      teacherId: teacherObj?.id || 'teacher-1',
      teacherName: teacherObj?.name || 'Faculty Instructor',
      teacherEmail: teacherObj?.email || 'faculty@university.edu',
      room: courseRoom.trim(),
      schedule: courseSchedule.trim(),
      color: 'indigo',
      description: `Active university course held in ${courseRoom}.`
    });

    showToast(`Course ${courseCode.toUpperCase()} created successfully!`);
    setIsAddCourseOpen(false);
    setCourseCode('');
    setCourseName('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Classroom Setup Window Modal */}
      <SetupClassroomsModal
        isOpen={isClassroomWindowOpen}
        onClose={() => setIsClassroomWindowOpen(false)}
      />

      {/* Multi-Tenant Client Universities / Institutions Modal */}
      <InstitutionsManagerModal
        isOpen={isInstitutionsModalOpen}
        onClose={() => setIsInstitutionsModalOpen(false)}
      />

      {/* Commercial Client Handover Dossier Modal */}
      <InstitutionHandoverModal
        institution={selectedHandoverInst}
        isOpen={!!selectedHandoverInst}
        onClose={() => setSelectedHandoverInst(null)}
        onSwitchToInstitution={(instId) => {
          showToast(`Switched active institution to ${currentInstitution.name}`);
        }}
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Master Administrator Authority
              </span>
              <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline-flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {currentInstitution.shortName} ({currentInstitution.code})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Space_Grotesk'] tracking-tight">
              Academic Operations Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              You have full system control. Manage classrooms, schedule courses, oversee faculty and student accounts, adjust deliverables, and provision client universities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* BUTTON TO OPEN INSTITUTIONS MULTI-TENANT MODAL */}
            <button
              id="btn-admin-manage-institutions"
              type="button"
              onClick={() => setIsInstitutionsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Multi-School / Client Universities ({institutions.length})</span>
            </button>

            {/* BUTTON TO OPEN SEPARATE CLASSROOM WINDOW */}
            <button
              id="btn-admin-setup-classrooms-window"
              type="button"
              onClick={() => setIsClassroomWindowOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <School className="w-4 h-4" />
              <span>Setup Classrooms (Window)</span>
            </button>

            <button
              id="btn-admin-add-course"
              type="button"
              onClick={() => setIsAddCourseOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Create Course</span>
            </button>

            <button
              id="btn-admin-add-user"
              type="button"
              onClick={() => setIsAddUserOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Impersonation / View As Bar */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
          <UserCheck className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Builder Quick-Switch:</strong> Test the campus experience through any account:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="btn-impersonate-alex"
            type="button"
            onClick={() => {
              const alex = students.find(s => s.name.includes('Alex')) || students[0];
              if (alex) {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('campushub_admin_impersonating', 'true');
                }
                switchUser(alex.id);
                showToast(`Switched view to Student Alex Rivera`);
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 font-semibold border border-amber-200 dark:border-amber-800 shadow-2xs"
          >
            Student: Alex Rivera
          </button>

          <button
            id="btn-impersonate-chen"
            type="button"
            onClick={() => {
              const chen = teachers.find(t => t.name.includes('Chen')) || teachers[0];
              if (chen) {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('campushub_admin_impersonating', 'true');
                }
                switchUser(chen.id);
                showToast(`Switched view to Faculty Dr. Robert Chen`);
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 font-semibold border border-amber-200 dark:border-amber-800 shadow-2xs"
          >
            Teacher: Dr. Robert Chen
          </button>

          <button
            id="btn-impersonate-williams"
            type="button"
            onClick={() => {
              const prof = teachers.find(t => t.name.includes('Williams')) || teachers[1];
              if (prof) {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('campushub_admin_impersonating', 'true');
                }
                switchUser(prof.id);
                showToast(`Switched view to Prof. Sarah Williams`);
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 font-semibold border border-amber-200 dark:border-amber-800 shadow-2xs"
          >
            Teacher: Prof. Williams
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Classrooms</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{classrooms.length}</p>
          <button
            onClick={() => setIsClassroomWindowOpen(true)}
            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold mt-1 block"
          >
            Open Setup Window &rarr;
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Courses</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{classes.length}</p>
          <span className="text-[10px] text-slate-400">Semester Catalog</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Students</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{students.length}</p>
          <span className="text-[10px] text-slate-400">Enrolled Users</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Faculty Staff</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{teachers.length}</p>
          <span className="text-[10px] text-slate-400">Teaching Staff</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assignments</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{assignments.length}</p>
          <span className="text-[10px] text-slate-400">{submissions.length} Submissions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SV-Code Status</span>
          <p className="text-xs font-mono font-black text-amber-600 dark:text-amber-400 mt-2 truncate">
            {staffVerificationCode}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">Active & Enforced</span>
        </div>
      </div>

      {/* Admin Module Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80">
        <button
          type="button"
          id="tab-admin-institutions"
          onClick={() => setActiveAdminSubTab('institutions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminSubTab === 'institutions'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs shadow-emerald-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Universities & Clients</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeAdminSubTab === 'institutions'
              ? 'bg-white/20 text-white'
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
          }`}>
            {institutions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminSubTab('classrooms')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminSubTab === 'classrooms'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <School className="w-3.5 h-3.5" />
          <span>Classroom Setup & Rooms</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            {classrooms.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminSubTab('courses')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminSubTab === 'courses'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Course Catalog</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {classes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminSubTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminSubTab === 'users'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Users & Roles</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminSubTab('assignments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminSubTab === 'assignments'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Assignments Oversight</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {assignments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminSubTab('announcements')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminSubTab === 'announcements'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Announcements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminSubTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminSubTab === 'security'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>SV-Code & Access</span>
        </button>
      </div>

      {/* TAB 0: MULTI-TENANT UNIVERSITIES & CLIENTS (SELLING / ONBOARDING PLATFORM) */}
      {activeAdminSubTab === 'institutions' && (
        selectedDetailsInstitution ? (
          <InstitutionDetailsView
            institution={selectedDetailsInstitution}
            onBack={() => setSelectedDetailsInstitution(null)}
            onOpenPrincipalWindow={(inst) => setPrincipalWindowInstitution(inst)}
            onSwitchCampus={(id) => {
              switchInstitution(id);
              showToast(`Switched active institution`);
            }}
            onOpenHandover={(inst) => setSelectedHandoverInst(inst)}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 text-white">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Commercial Multi-Tenancy Hub
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {institutions.length} Client Universities Active
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black font-['Space_Grotesk'] tracking-tight text-white">
                  Universities & Institutional Licensing
                </h3>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Click on any institution to open its complete schedule, timetables, classrooms, courses, and announcements. Or launch its dedicated Principal Control Window to manage operations autonomously without platform admin privileges.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  id="btn-tab-provision-new-institution"
                  type="button"
                  onClick={() => setIsInstitutionsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Provision New University</span>
                </button>
              </div>
            </div>

            {/* Current Active Scope Notification */}
            <div className="p-3.5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>
                  <strong>Currently Active Campus:</strong> {currentInstitution.name} ({currentInstitution.code}) &bull; Domain: <code>{currentInstitution.domain}</code>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                SV-Code: <strong className="font-mono text-amber-600 dark:text-amber-400">{currentInstitution.staffVerificationCode}</strong>
              </span>
            </div>

            {/* Institutions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {institutions.map((inst) => {
                const isCurrent = inst.id === currentInstitution.id;
                const instRooms = classrooms.filter(r => r.institutionId === inst.id);
                const instClasses = classes.filter(c => c.institutionId === inst.id);
                const instUsers = users.filter(u => u.institutionId === inst.id);
                const instAdmin = instUsers.find(u => u.role === 'admin');
                const instPrincipal = instUsers.find(u => u.role === 'principal');

                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedDetailsInstitution(inst)}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between relative bg-white dark:bg-slate-900 shadow-xs cursor-pointer group hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 ${
                      isCurrent
                        ? 'border-emerald-500/60 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Top Bar */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-md shrink-0 font-['Space_Grotesk'] group-hover:scale-105 transition-transform">
                            {inst.logoText || inst.code.slice(0, 3)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {inst.name}
                              </h4>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Active Campus
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                              {inst.code} &bull; {inst.domain}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                          {inst.licenseTier}
                        </span>
                      </div>

                      {inst.tagline && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-3">
                          "{inst.tagline}"
                        </p>
                      )}

                      {/* Stats Pill Row */}
                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center mb-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rooms</span>
                          <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                            {instRooms.length > 0 ? instRooms.length : (isCurrent ? classrooms.length : 1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Courses</span>
                          <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                            {instClasses.length > 0 ? instClasses.length : (isCurrent ? classes.length : 1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accounts</span>
                          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                            {instUsers.length > 0 ? instUsers.length : (isCurrent ? users.length : 2)}
                          </span>
                        </div>
                      </div>

                      {/* Credentials, Principal & SV-Code */}
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4 font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-sans flex items-center gap-1">
                            <School className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Principal / Dean:</span>
                          </span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400 truncate max-w-[200px]">
                            {instPrincipal ? instPrincipal.name : `${inst.name} Principal Office`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-sans">Admin Contact:</span>
                          <span className="font-semibold truncate max-w-[200px]">
                            {inst.contactAdminName} ({inst.contactAdminEmail})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-sans">Faculty SV-Code:</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {inst.staffVerificationCode}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div
                      className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Open Details & Timetable Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedDetailsInstitution(inst)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          title="Open full timetable, schedule, and institutional details"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>View Details & Timetables</span>
                        </button>

                        {/* Open Principal Control Window */}
                        <button
                          type="button"
                          onClick={() => setPrincipalWindowInstitution(inst)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          title="Launch dedicated principal executive workspace"
                        >
                          <School className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Principal Window</span>
                        </button>

                        {!isCurrent ? (
                          <button
                            type="button"
                            onClick={() => {
                              switchInstitution(inst.id);
                              showToast(`Switched active institution to ${inst.name}`);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                          >
                            Switch Campus
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedHandoverInst(inst)}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                          title="View and copy official client handover packet"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="hidden sm:inline">Handover</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {instAdmin && instAdmin.id !== currentUser.id && (
                          <button
                            type="button"
                            onClick={() => {
                              switchInstitution(inst.id);
                              switchUser(instAdmin.id);
                              showToast(`Logged in as Admin: ${instAdmin.name}`);
                            }}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                            title="Instant login as this institution's administrator"
                          >
                            Login as Admin
                          </button>
                        )}

                        {institutions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Decommission and remove ${inst.name} from the platform?`)) {
                                deleteInstitution(inst.id);
                                showToast(`Institution ${inst.name} decommissioned.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Decommission institution"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* TAB 1: CLASSROOM SETUP & ROOMS */}
      {activeAdminSubTab === 'classrooms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                University Classrooms & Room Scheduling
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure classroom facilities, course subjects taught, instructor assignments, days, and times.
              </p>
            </div>

            <button
              id="btn-launch-separate-classroom-window"
              type="button"
              onClick={() => setIsClassroomWindowOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Classroom Window</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((room) => (
              <div
                key={room.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white font-['Space_Grotesk']">
                      {room.roomNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {room.type}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    {room.courseCode}: {room.courseSubject}
                  </p>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{room.building}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{room.capacity} seats capacity</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{room.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{room.days.join(', ')} &bull; {room.startTime} - {room.endTime}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setIsClassroomWindowOpen(true)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Edit in Window &rarr;
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete classroom "${room.roomNumber}"?`)) {
                        db.deleteClassroom(room.id);
                        showToast(`Classroom ${room.roomNumber} deleted.`);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    title="Delete Room"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ALL COURSES CATALOG */}
      {activeAdminSubTab === 'courses' && (
        <div className="space-y-4">
          {/* Add Course Modal/Form */}
          {isAddCourseOpen && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/40 shadow-xl space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Create New University Course</h4>
                <button onClick={() => setIsAddCourseOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 font-semibold">
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateCourseSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS410"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Machine Learning"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Teacher</label>
                  <select
                    value={courseTeacherId}
                    onChange={(e) => setCourseTeacherId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="">Select Instructor</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Classroom / Hall</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Turing Hall 304"
                    value={courseRoom}
                    onChange={(e) => setCourseRoom(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Schedule Slot</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tue & Thu 02:00 PM - 03:30 PM"
                    value={courseSchedule}
                    onChange={(e) => setCourseSchedule(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Save Course
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5">Code & Name</th>
                    <th className="p-3.5">Assigned Instructor</th>
                    <th className="p-3.5">Classroom & Schedule</th>
                    <th className="p-3.5">Join Code</th>
                    <th className="p-3.5">Students</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {cls.code}
                          </span>
                          <span className="font-bold">{cls.name}</span>
                        </div>
                      </td>
                      <td className="p-3.5">{cls.teacherName}</td>
                      <td className="p-3.5">
                        <div className="font-medium">{cls.room}</div>
                        <div className="text-[10px] text-slate-400">{cls.schedule}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-600 dark:text-slate-300">{cls.joinCode}</td>
                      <td className="p-3.5">{cls.enrolledStudentCount || 0}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteCourse(cls)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALL USERS & ROLES */}
      {activeAdminSubTab === 'users' && (
        <div className="space-y-4">
          {/* Add User Form Drawer */}
          {isAddUserOpen && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-500/40 shadow-xl space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Register New University User</h4>
                <button onClick={() => setIsAddUserOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 font-semibold">
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateUserSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Smith"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">University Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. j.smith@university.edu"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Faculty / Teacher</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserDepartment}
                    onChange={(e) => setNewUserDepartment(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Password</th>
                    <th className="p-3.5">Switch View</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : u.role === 'teacher'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5">{u.department || 'General'}</td>
                      <td className="p-3.5 font-mono text-slate-500">{u.password || 'password123'}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => {
                            switchUser(u.id);
                            showToast(`Switched view to ${u.name}`);
                          }}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View As {u.role} &rarr;
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSIGNMENTS OVERSIGHT */}
      {activeAdminSubTab === 'assignments' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5">Assignment</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5">Points</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {assignments.map((a) => {
                    const cls = classes.find(c => c.id === a.classId);
                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold">{a.title}</div>
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400">{cls?.code || a.classId}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {a.category}
                          </span>
                        </td>
                        <td className="p-3.5">{a.dueDate}</td>
                        <td className="p-3.5 font-bold">{a.points} pts</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteAssignment(a)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeAdminSubTab === 'announcements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {ann.classCode || 'Campus Alert'}
                    </span>
                    {ann.pinned && (
                      <span className="text-[10px] font-bold text-amber-600">Pinned</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{ann.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-2">{ann.content}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>By {ann.authorName}</span>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SV-CODE & SECURITY */}
      {activeAdminSubTab === 'security' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-['Space_Grotesk']">
                  Staff Verification Code (SV-Code) Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  This code is required by faculty instructors during registration and login to verify valid university staff credentials.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateSVCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Active Staff Verification Code
                </label>
                <input
                  type="text"
                  required
                  value={editingSVCode}
                  onChange={(e) => setEditingSVCode(e.target.value)}
                  className="w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditingSVCode('SV-TEACH-2026')}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold"
                >
                  Reset to default (SV-TEACH-2026)
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Master SV-Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Principal Control Window Modal */}
      {principalWindowInstitution && (
        <PrincipalControlWindow
          institution={principalWindowInstitution}
          isOpen={true}
          onClose={() => setPrincipalWindowInstitution(null)}
        />
      )}
    </div>
  );
};
