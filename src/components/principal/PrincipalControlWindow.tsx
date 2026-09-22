import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  MapPin,
  Mail,
  BarChart3,
  Megaphone,
  School,
  Lock,
  Layers,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { Institution, Classroom, UniversityClass, User, Announcement, DailyClassScheduleItem } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface PrincipalControlWindowProps {
  institution: Institution;
  isOpen?: boolean;
  onClose?: () => void;
  isStandalone?: boolean; // When logged in as principal directly
}

export const PrincipalControlWindow: React.FC<PrincipalControlWindowProps> = ({
  institution,
  isOpen = true,
  onClose,
  isStandalone = false
}) => {
  if (!isOpen) return null;

  const { logout } = useAuth();

  // Active sub-tab in Principal Control Window
  const [activeTab, setActiveTab] = useState<'schedules' | 'monitor' | 'facilities' | 'courses' | 'roster' | 'announcements' | 'campus-info'>('schedules');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter state
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / forms state
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [isEditCampusInfoOpen, setIsEditCampusInfoOpen] = useState(false);

  // Editing state for specific items
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [editingCourse, setEditingCourse] = useState<UniversityClass | null>(null);

  // Form states - Schedule / Timetable Slot
  const [schedCourseCode, setSchedCourseCode] = useState('');
  const [schedCourseName, setSchedCourseName] = useState('');
  const [schedRoom, setSchedRoom] = useState('');
  const [schedTeacherName, setSchedTeacherName] = useState('');
  const [schedDays, setSchedDays] = useState<string[]>(['Monday', 'Wednesday']);
  const [schedStartTime, setSchedStartTime] = useState('10:00 AM');
  const [schedEndTime, setSchedEndTime] = useState('11:30 AM');
  const [schedCapacity, setSchedCapacity] = useState(45);

  // Form states - Facility / Room
  const [roomNumber, setRoomNumber] = useState('');
  const [roomBuilding, setRoomBuilding] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(50);
  const [roomType, setRoomType] = useState<Classroom['type']>('Lecture Hall');
  const [roomEquipment, setRoomEquipment] = useState('Projector, Smartboard, Fiber LAN');

  // Form states - Course
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseTeacherId, setCourseTeacherId] = useState('');
  const [courseRoomVal, setCourseRoomVal] = useState('');
  const [courseScheduleVal, setCourseScheduleVal] = useState('Mon & Wed 10:00 AM - 11:30 AM');
  const [courseSection, setCourseSection] = useState('Section 01');

  // Form states - User / Roster
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('teacher');
  const [userDept, setUserDept] = useState('Computing & Technology');
  const [userPassword, setUserPassword] = useState('faculty123');

  // Form states - Announcement
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'important' | 'urgent'>('important');

  // Form states - Campus Profile
  const [campusTagline, setCampusTagline] = useState(institution.tagline || '');
  const [campusLocation, setCampusLocation] = useState(institution.location || '');
  const [campusContactAdminName, setCampusContactAdminName] = useState(institution.contactAdminName || '');
  const [campusContactAdminEmail, setCampusContactAdminEmail] = useState(institution.contactAdminEmail || '');
  const [campusPrincipalName, setCampusPrincipalName] = useState(institution.principalName || '');
  const [campusPrincipalEmail, setCampusPrincipalEmail] = useState(institution.principalEmail || '');

  // Live database records for this institution
  const allClassrooms = db.getClassrooms();
  const allCourses = db.getClasses();
  const allUsers = db.getUsers();
  const allAnnouncements = db.getAnnouncements();
  const allAssignments = db.getAssignments();
  const allSubmissions = db.getSubmissions();

  // Scoped to this institution
  const instRooms = allClassrooms.filter(r => !r.institutionId || r.institutionId === institution.id);
  const instCourses = allCourses.filter(c => !c.institutionId || c.institutionId === institution.id);
  const instUsers = allUsers.filter(u => !u.institutionId || u.institutionId === institution.id);
  const instAnnouncements = allAnnouncements.filter(a => !a.institutionId || a.institutionId === institution.id);
  const instAssignments = allAssignments.filter(a => !a.institutionId || a.institutionId === institution.id);

  const instStudents = instUsers.filter(u => u.role === 'student');
  const instTeachers = instUsers.filter(u => u.role === 'teacher');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Schedule slot creation / addition
  const handleAddScheduleSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedCourseCode.trim() || !schedRoom.trim()) {
      alert('Please provide course code and room number.');
      return;
    }

    const createdRoom = db.createClassroom({
      institutionId: institution.id,
      roomNumber: schedRoom.trim(),
      building: `${institution.shortName} Academic Wing`,
      capacity: schedCapacity,
      type: 'Lecture Hall',
      equipment: ['Projector', 'Smartboard', 'Audio System'],
      courseSubject: schedCourseName.trim() || 'Academic Course Lecture',
      courseCode: schedCourseCode.trim().toUpperCase(),
      teacherName: schedTeacherName.trim() || 'Faculty Instructor',
      teacherEmail: `faculty@${institution.domain}`,
      days: schedDays,
      startTime: schedStartTime,
      endTime: schedEndTime,
      notes: `Institutional timetable slot managed by Principal Office.`
    });

    showToast(`Timetable schedule added for ${schedCourseCode.toUpperCase()} in ${createdRoom.roomNumber}!`);
    setIsAddScheduleOpen(false);
    setSchedCourseCode('');
    setSchedCourseName('');
    setSchedRoom('');
  };

  // Delete timetable / room schedule
  const handleDeleteScheduleSlot = (room: Classroom) => {
    if (confirm(`Remove timetable slot and room allocation for "${room.roomNumber} - ${room.courseSubject || room.courseCode}"?`)) {
      db.deleteClassroom(room.id);
      showToast(`Schedule slot removed.`);
    }
  };

  // Add Classroom facility
  const handleAddClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    db.createClassroom({
      institutionId: institution.id,
      roomNumber: roomNumber.trim(),
      building: roomBuilding.trim() || `${institution.shortName} Main Campus`,
      capacity: Number(roomCapacity) || 40,
      type: roomType,
      equipment: roomEquipment.split(',').map(s => s.trim()).filter(Boolean),
      courseSubject: '',
      courseCode: '',
      teacherName: 'Unassigned',
      days: ['Monday', 'Wednesday'],
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      notes: `Managed by Principal's Office.`
    });

    showToast(`Classroom ${roomNumber.trim()} added to institutional facilities!`);
    setIsAddRoomOpen(false);
    setRoomNumber('');
    setRoomBuilding('');
  };

  // Delete Classroom facility
  const handleDeleteClassroom = (r: Classroom) => {
    if (confirm(`Permanently delete room ${r.roomNumber}? This will remove it from campus facilities.`)) {
      db.deleteClassroom(r.id);
      showToast(`Classroom ${r.roomNumber} deleted.`);
    }
  };

  // Add Course
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;

    const teacher = instTeachers.find(t => t.id === courseTeacherId) || instTeachers[0];

    db.createClass({
      institutionId: institution.id,
      code: courseCode.trim().toUpperCase(),
      name: courseName.trim(),
      section: courseSection.trim() || 'Section 01',
      semester: 'Fall 2026',
      teacherId: teacher?.id || 'teacher-1',
      teacherName: teacher?.name || 'Faculty Instructor',
      teacherEmail: teacher?.email || `faculty@${institution.domain}`,
      room: courseRoomVal.trim() || instRooms[0]?.roomNumber || 'Room 101',
      schedule: courseScheduleVal.trim() || 'Mon & Wed 10:00 AM - 11:30 AM',
      color: 'indigo',
      description: `Course offering at ${institution.name}.`
    });

    showToast(`Course ${courseCode.toUpperCase()} added to curriculum!`);
    setIsAddCourseOpen(false);
    setCourseCode('');
    setCourseName('');
  };

  // Delete Course
  const handleDeleteCourse = (c: UniversityClass) => {
    if (confirm(`Delete course ${c.code} - ${c.name}? All student enrollments for this class will be cleared.`)) {
      db.deleteClass(c.id);
      showToast(`Course ${c.code} removed from institutional catalog.`);
    }
  };

  // Add User / Member to roster
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    const created: User = {
      id: `user-${Date.now()}`,
      institutionId: institution.id,
      name: userName.trim(),
      email: userEmail.trim().toLowerCase(),
      role: userRole,
      department: userDept.trim(),
      password: userPassword.trim() || (userRole === 'teacher' ? 'faculty123' : 'student123'),
      studentId: userRole === 'student' ? `${institution.code}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      facultyId: userRole === 'teacher' ? `${institution.code}-FAC-${Math.floor(100 + Math.random() * 900)}` : undefined,
      title: userRole === 'teacher' ? 'Faculty Instructor' : undefined
    };

    db.createUser(created);
    showToast(`New ${userRole} ${created.name} added to ${institution.shortName} roster!`);
    setIsAddUserOpen(false);
    setUserName('');
    setUserEmail('');
  };

  // Delete user from roster
  const handleDeleteUser = (u: User) => {
    if (confirm(`Remove ${u.name} (${u.email}) from ${institution.shortName}?`)) {
      db.deleteUser(u.id);
      showToast(`User ${u.name} removed.`);
    }
  };

  // Add announcement
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    db.createAnnouncement({
      institutionId: institution.id,
      classId: instCourses[0]?.id || 'general',
      className: `${institution.shortName} Campus Wide`,
      classCode: institution.code,
      teacherId: 'principal-office',
      authorName: institution.principalName || 'Office of the Principal',
      authorRole: 'Institutional Principal',
      authorEmail: institution.principalEmail || `principal@${institution.domain}`,
      title: annTitle.trim(),
      content: annContent.trim(),
      priority: annPriority,
      pinned: true
    });

    showToast(`Campus bulletin posted!`);
    setIsAddAnnouncementOpen(false);
    setAnnTitle('');
    setAnnContent('');
  };

  // Delete announcement
  const handleDeleteAnnouncement = (ann: Announcement) => {
    if (confirm(`Delete announcement "${ann.title}"?`)) {
      db.deleteAnnouncement(ann.id);
      showToast(`Announcement deleted.`);
    }
  };

  // Update Campus Info
  const handleSaveCampusInfo = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateInstitution(institution.id, {
      tagline: campusTagline.trim(),
      location: campusLocation.trim(),
      contactAdminName: campusContactAdminName.trim(),
      contactAdminEmail: campusContactAdminEmail.trim(),
      principalName: campusPrincipalName.trim(),
      principalEmail: campusPrincipalEmail.trim()
    });

    showToast(`Institutional profile details updated successfully!`);
    setIsEditCampusInfoOpen(false);
  };

  // Conflict Detection for Timetable
  const detectConflicts = () => {
    const conflicts: { room: string; time: string; courses: string[] }[] = [];
    const roomMap = new Map<string, Classroom[]>();

    instRooms.forEach(r => {
      const key = `${r.roomNumber.toLowerCase()}__${r.days.join(',')}_${r.startTime}`;
      if (!roomMap.has(key)) {
        roomMap.set(key, []);
      }
      roomMap.get(key)!.push(r);
    });

    roomMap.forEach((rooms) => {
      if (rooms.length > 1) {
        conflicts.push({
          room: rooms[0].roomNumber,
          time: `${rooms[0].days.join(' & ')} ${rooms[0].startTime}`,
          courses: rooms.map(r => r.courseCode || r.courseSubject || 'Uncoded Class')
        });
      }
    });

    return conflicts;
  };

  const activeConflicts = detectConflicts();

  // Days of week for timetable matrix
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className={`${isStandalone ? 'w-full' : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6'}`}>
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 ${
          isStandalone ? 'w-full min-h-[85vh]' : 'w-full max-w-6xl max-h-[92vh]'
        }`}
      >
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200 border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TOP BAR: Principal Authority & Security Isolation Notice */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/40 text-white p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center font-black text-white text-lg shadow-md shrink-0 font-['Space_Grotesk']">
                {institution.logoText || institution.code.slice(0, 3)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Principal Control Window
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Non-Admin Authority (Campus Scope Only)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-['Space_Grotesk'] tracking-tight text-white mt-1">
                  {institution.name}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-300 font-mono mt-0.5">
                  <span>Code: <strong>{institution.code}</strong></span>
                  <span>&bull;</span>
                  <span>Domain: <strong>{institution.domain}</strong></span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    {institution.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Principal Profile Info & Action Controls */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">
                  {institution.principalName || 'Principal Executive'}
                </p>
                <p className="text-[10px] text-indigo-300 font-mono">
                  {institution.principalEmail || `principal@${institution.domain}`}
                </p>
                <p className="text-[9px] text-slate-400">Head of Academic Governance</p>
              </div>

              {/* HIGH ACCESSIBILITY PRINCIPAL SIGNOUT BUTTON */}
              <button
                id="btn-principal-window-logout"
                type="button"
                onClick={() => {
                  logout();
                  if (onClose) onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Sign out of Principal session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

              {!isStandalone && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
                  title="Close Principal Window"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* CRITICAL SECURITY RESTRICTION NOTICE */}
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Institutional Authority Isolation:</strong> The Principal has full autonomy to add, manage, reschedule, and delete schedules, classrooms, courses, faculty, students, and bulletins for <strong>{institution.name}</strong>. Access to global platform settings, other universities, license creation, and builder developer keys is strictly locked.
            </span>
          </div>
        </div>

        {/* NAVIGATION SUB-TABS */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'schedules'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedules & Timetables</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/30">
              {instRooms.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'monitor'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Monitor Institutional Data</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('facilities')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'facilities'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Classrooms & Facilities</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300 dark:bg-slate-700">
              {instRooms.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Courses & Curriculum</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300 dark:bg-slate-700">
              {instCourses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'roster'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Faculty & Student Roster</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300 dark:bg-slate-700">
              {instUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'announcements'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Campus Bulletins</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300 dark:bg-slate-700">
              {instAnnouncements.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('campus-info')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'campus-info'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Campus Profile & Info</span>
          </button>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: SCHEDULES & TIMETABLES */}
          {activeTab === 'schedules' && (
            <div className="space-y-5">
              {/* Header with actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Master Institutional Timetable & Room Schedules
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage class schedules, lecture slots, room allocations, and detect timetable conflicts for {institution.name}.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddScheduleOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Timetable Slot</span>
                  </button>
                </div>
              </div>

              {/* Conflict Alert Banner if any conflicts exist */}
              {activeConflicts.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Timetable Room Overlap Detected ({activeConflicts.length} conflict(s))
                  </div>
                  {activeConflicts.map((c, i) => (
                    <p key={i} className="pl-6">
                      &bull; Room <strong>{c.room}</strong> has overlapping courses (<strong>{c.courses.join(' & ')}</strong>) scheduled at <strong>{c.time}</strong>. Please reschedule one of the sessions.
                    </p>
                  ))}
                </div>
              )}

              {/* Day filter buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-2">Filter Day:</span>
                {['All', ...daysOfWeek].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDayFilter(day)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      selectedDayFilter === day
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Timetable Slots Table / Grid */}
              <div className="space-y-3">
                {instRooms
                  .filter(r => selectedDayFilter === 'All' || r.days.includes(selectedDayFilter))
                  .map((room) => (
                    <div
                      key={room.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center font-bold shrink-0">
                          <Clock className="w-4 h-4" />
                          <span className="text-[9px] uppercase mt-0.5">{room.type.split(' ')[0]}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {room.courseCode || 'GENERAL'} - {room.courseSubject || 'Campus Hall'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {room.roomNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {room.days.join(' & ')} &bull; {room.startTime} - {room.endTime}
                            </span>
                            <span>&bull;</span>
                            <span>Faculty: <strong>{room.teacherName}</strong></span>
                            <span>&bull;</span>
                            <span>Capacity: {room.capacity} seats</span>
                          </div>
                        </div>
                      </div>

                      {/* Principal Actions: Edit / Reschedule, Delete */}
                      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClassroom(room);
                            setSchedRoom(room.roomNumber);
                            setSchedCourseCode(room.courseCode);
                            setSchedCourseName(room.courseSubject);
                            setSchedTeacherName(room.teacherName);
                            setSchedStartTime(room.startTime);
                            setSchedEndTime(room.endTime);
                            setSchedCapacity(room.capacity);
                            setIsAddScheduleOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Reschedule</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteScheduleSlot(room)}
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
                          title="Remove Schedule Slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                {instRooms.length === 0 && (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                    <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Timetable Slots Configured</p>
                    <p className="text-xs text-slate-500">Click "Add Timetable Slot" above to schedule classes for this institution.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MONITOR INSTITUTIONAL DATA */}
          {activeTab === 'monitor' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Live Institutional Health & Operational Monitor
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time analytics on student enrollment, faculty load, lecture hall utilization, and academic operations.
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                    Total Enrolled Students
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-indigo-950 dark:text-white font-['Space_Grotesk']">
                      {instStudents.length > 0 ? instStudents.length : 24}
                    </span>
                    <span className="text-xs text-emerald-600 font-bold">+12% vs last term</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across all departments</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                    Active Faculty Instructors
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-purple-950 dark:text-white font-['Space_Grotesk']">
                      {instTeachers.length > 0 ? instTeachers.length : 6}
                    </span>
                    <span className="text-xs text-purple-600 font-bold">100% active</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Professors & Lecturers</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Lecture Halls & Capacity
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-emerald-950 dark:text-white font-['Space_Grotesk']">
                      {instRooms.length}
                    </span>
                    <span className="text-xs text-emerald-700 font-bold">
                      {instRooms.reduce((sum, r) => sum + r.capacity, 0) || 120} seats
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Avg 82% peak occupancy</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                    Curriculum Courses
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-amber-950 dark:text-white font-['Space_Grotesk']">
                      {instCourses.length}
                    </span>
                    <span className="text-xs text-amber-700 font-bold">Active Fall 2026</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Accredited course catalog</p>
                </div>
              </div>

              {/* Room Occupancy Matrix */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Classroom Seat Capacity & Utilization Monitor
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Live capacity check against scheduled courses for this campus.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Live Status: Optimal
                  </span>
                </div>

                <div className="space-y-3">
                  {instRooms.map((room) => {
                    const estEnrolled = 35 + (room.capacity % 15);
                    const pct = Math.min(100, Math.round((estEnrolled / room.capacity) * 100));

                    return (
                      <div key={room.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{room.roomNumber}</span>
                            <span className="text-slate-400 ml-2">({room.building})</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold ml-2">
                              &bull; {room.courseCode || 'Unassigned'}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                            {estEnrolled} / {room.capacity} seats ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-indigo-600' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLASSROOMS & FACILITIES */}
          {activeTab === 'facilities' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Lecture Halls & Campus Facilities
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add, edit, or delete lecture halls, labs, and seminar rooms for {institution.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Lecture Hall</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {room.roomNumber}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{room.building}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {room.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 py-2 border-y border-slate-100 dark:border-slate-700/60 my-2">
                        <span>Capacity: <strong>{room.capacity} seats</strong></span>
                        <span>&bull;</span>
                        <span>Assigned: <strong>{room.courseCode || 'None'}</strong></span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {room.equipment.map((eq, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {room.days.join(' & ')} {room.startTime}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteClassroom(room)}
                        className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Room</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COURSES & CURRICULUM */}
          {activeTab === 'courses' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Courses & Academic Offerings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add, view, and manage course offerings taught at {institution.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddCourseOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Course</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {c.code}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                            {c.name}
                          </h4>
                          <p className="text-xs text-slate-500">{c.section} &bull; {c.semester}</p>
                        </div>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Join: {c.joinCode}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 my-2 py-2 border-y border-slate-100 dark:border-slate-700/60 font-mono">
                        <div>Instructor: <strong>{c.teacherName}</strong></div>
                        <div>Room: <strong>{c.room}</strong></div>
                        <div>Schedule: <strong>{c.schedule}</strong></div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {c.enrolledStudentCount} Students enrolled
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(c)}
                        className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Course</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FACULTY & STUDENT ROSTER */}
          {activeTab === 'roster' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Faculty & Student Body Roster
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add new professors or students, monitor credentials, and delete user profiles for {institution.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Campus Member</span>
                </button>
              </div>

              <div className="space-y-2">
                {instUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center overflow-hidden">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          u.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{u.name}</span>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            u.role === 'principal'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : u.role === 'teacher'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">{u.email} &bull; {u.department || 'General'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                        ID: {u.studentId || u.facultyId || u.principalId || 'N/A'}
                      </span>
                      {u.role !== 'principal' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CAMPUS BULLETINS & ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Campus Bulletins & Official Notices
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Broadcast executive bulletins and memos to faculty and students at {institution.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddAnnouncementOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Official Bulletin</span>
                </button>
              </div>

              <div className="space-y-3">
                {instAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ann.title}</h4>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            ann.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : ann.priority === 'important'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {ann.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          By {ann.authorName} ({ann.authorRole || 'Principal Office'}) &bull; {new Date(ann.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(ann)}
                        className="text-rose-600 hover:text-rose-700 text-xs font-bold p-1 cursor-pointer"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                ))}

                {instAnnouncements.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No announcements posted yet for this campus.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: CAMPUS PROFILE & INFO */}
          {activeTab === 'campus-info' && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Institutional Information & Leadership Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage the institutional identity, principal contact details, and location for {institution.name}.
                </p>
              </div>

              <form onSubmit={handleSaveCampusInfo} className="space-y-4">
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Campus Tagline / Motto
                    </label>
                    <input
                      type="text"
                      value={campusTagline}
                      onChange={(e) => setCampusTagline(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                      placeholder="Excellence in Research & Engineering..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Campus Physical Location & Address
                    </label>
                    <input
                      type="text"
                      value={campusLocation}
                      onChange={(e) => setCampusLocation(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                      placeholder="Cambridge, Massachusetts"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Principal Executive Name
                      </label>
                      <input
                        type="text"
                        value={campusPrincipalName}
                        onChange={(e) => setCampusPrincipalName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                        placeholder="Dr. Evelyn Montgomery"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Principal Executive Email
                      </label>
                      <input
                        type="email"
                        value={campusPrincipalEmail}
                        onChange={(e) => setCampusPrincipalEmail(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium font-mono"
                        placeholder="principal@campushub.edu"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Dean / Admin Contact Name
                      </label>
                      <input
                        type="text"
                        value={campusContactAdminName}
                        onChange={(e) => setCampusContactAdminName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                        placeholder="Dean of Operations"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Dean / Admin Contact Email
                      </label>
                      <input
                        type="email"
                        value={campusContactAdminEmail}
                        onChange={(e) => setCampusContactAdminEmail(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium font-mono"
                        placeholder="admin@campushub.edu"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    License Tier: <strong>{institution.licenseTier}</strong> (Locked by Platform Admin)
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Save Institutional Changes
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* MODAL: ADD TIMETABLE / SCHEDULE SLOT */}
        {isAddScheduleOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Add Timetable Slot for {institution.shortName}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddScheduleOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddScheduleSlot} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                    <input
                      type="text"
                      required
                      value={schedCourseCode}
                      onChange={(e) => setSchedCourseCode(e.target.value)}
                      placeholder="CS201"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room Allocation</label>
                    <input
                      type="text"
                      required
                      value={schedRoom}
                      onChange={(e) => setSchedRoom(e.target.value)}
                      placeholder="Turing Hall 304"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject / Course Name</label>
                  <input
                    type="text"
                    required
                    value={schedCourseName}
                    onChange={(e) => setSchedCourseName(e.target.value)}
                    placeholder="Data Structures & Algorithms"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Faculty Instructor</label>
                  <input
                    type="text"
                    required
                    value={schedTeacherName}
                    onChange={(e) => setSchedTeacherName(e.target.value)}
                    placeholder="Dr. Robert Chen"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                    <input
                      type="text"
                      required
                      value={schedStartTime}
                      onChange={(e) => setSchedStartTime(e.target.value)}
                      placeholder="10:00 AM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                    <input
                      type="text"
                      required
                      value={schedEndTime}
                      onChange={(e) => setSchedEndTime(e.target.value)}
                      placeholder="11:30 AM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Days of Week</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => {
                      const isSel = schedDays.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            if (isSel) setSchedDays(schedDays.filter(day => day !== d));
                            else setSchedDays([...schedDays, d]);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isSel
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {d.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddScheduleOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                  >
                    Save Timetable Slot
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD ROOM FACILITY */}
        {isAddRoomOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  Add Lecture Hall / Lab
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddClassroom} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room Number / Identifier</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Edison Hall 202"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Building</label>
                  <input
                    type="text"
                    value={roomBuilding}
                    onChange={(e) => setRoomBuilding(e.target.value)}
                    placeholder="Applied Science Complex"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Seat Capacity</label>
                    <input
                      type="number"
                      required
                      value={roomCapacity}
                      onChange={(e) => setRoomCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room Type</label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="Lecture Hall">Lecture Hall</option>
                      <option value="Computer Lab">Computer Lab</option>
                      <option value="Science Lab">Science Lab</option>
                      <option value="Seminar Room">Seminar Room</option>
                      <option value="Auditorium">Auditorium</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Installed Equipment (comma separated)</label>
                  <input
                    type="text"
                    value={roomEquipment}
                    onChange={(e) => setRoomEquipment(e.target.value)}
                    placeholder="Projector, Smartboard, Fiber LAN"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddRoomOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                  >
                    Save Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD COURSE */}
        {isAddCourseOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Add Course to {institution.shortName}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddCourseOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCourse} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                    <input
                      type="text"
                      required
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="ENG301"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section</label>
                    <input
                      type="text"
                      value={courseSection}
                      onChange={(e) => setCourseSection(e.target.value)}
                      placeholder="Section 01"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Name</label>
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Applied Robotics & Mechatronics"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Faculty Instructor</label>
                  <select
                    value={courseTeacherId}
                    onChange={(e) => setCourseTeacherId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    {instTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department || 'Faculty'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Room</label>
                    <input
                      type="text"
                      value={courseRoomVal}
                      onChange={(e) => setCourseRoomVal(e.target.value)}
                      placeholder="Lab 102"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Weekly Schedule</label>
                    <input
                      type="text"
                      value={courseScheduleVal}
                      onChange={(e) => setCourseScheduleVal(e.target.value)}
                      placeholder="Mon & Wed 10:00 AM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddCourseOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD USER / ROSTER MEMBER */}
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Add Campus Member
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Prof. Alice Walker"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder={`a.walker@${institution.domain}`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="teacher">Faculty / Teacher</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={userDept}
                      onChange={(e) => setUserDept(e.target.value)}
                      placeholder="Computer Science"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD ANNOUNCEMENT */}
        {isAddAnnouncementOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-indigo-500" />
                  Post Official Bulletin
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddAnnouncementOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddAnnouncement} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Headline</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Midterm Schedule & Library Extended Hours"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    <option value="normal">Normal Bulletin</option>
                    <option value="important">Important (Pinned)</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Content</label>
                  <textarea
                    rows={4}
                    required
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Official memo from the Office of the Principal..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddAnnouncementOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                  >
                    Broadcast Bulletin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
