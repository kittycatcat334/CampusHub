import React, { useState } from 'react';
import { Institution, Classroom, UniversityClass, User, Announcement, Assignment } from '../../types';
import { db } from '../../services/db';
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
  ArrowLeft,
  Search,
  MapPin,
  Mail,
  School,
  FileCheck2,
  Megaphone,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface InstitutionDetailsViewProps {
  institution: Institution;
  onBack: () => void;
  onOpenPrincipalWindow: (inst: Institution) => void;
  onSwitchCampus: (instId: string) => void;
  onOpenHandover: (inst: Institution) => void;
}

export const InstitutionDetailsView: React.FC<InstitutionDetailsViewProps> = ({
  institution,
  onBack,
  onOpenPrincipalWindow,
  onSwitchCampus,
  onOpenHandover
}) => {
  const [activeTab, setActiveTab] = useState<'schedules' | 'classrooms' | 'courses' | 'roster' | 'announcements' | 'assignments'>('schedules');
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals inside details view
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Form states - Slot
  const [slotCourseCode, setSlotCourseCode] = useState('');
  const [slotCourseName, setSlotCourseName] = useState('');
  const [slotRoom, setSlotRoom] = useState('');
  const [slotTeacher, setSlotTeacher] = useState('');
  const [slotDays, setSlotDays] = useState<string[]>(['Monday', 'Wednesday']);
  const [slotStartTime, setSlotStartTime] = useState('09:00 AM');
  const [slotEndTime, setSlotEndTime] = useState('10:30 AM');
  const [slotCapacity, setSlotCapacity] = useState(50);

  // Form states - Room
  const [roomNumber, setRoomNumber] = useState('');
  const [roomBuilding, setRoomBuilding] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(45);
  const [roomType, setRoomType] = useState<Classroom['type']>('Lecture Hall');

  // Form states - Course
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseSection, setNewCourseSection] = useState('Section 01');

  // Form states - User
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'teacher'>('teacher');
  const [newUserDept, setNewUserDept] = useState('Applied Computing');

  // Scoped Data Queries
  const allClassrooms = db.getClassrooms();
  const allCourses = db.getClasses();
  const allUsers = db.getUsers();
  const allAnnouncements = db.getAnnouncements();
  const allAssignments = db.getAssignments();
  const allSubmissions = db.getSubmissions();

  const instRooms = allClassrooms.filter(r => !r.institutionId || r.institutionId === institution.id);
  const instCourses = allCourses.filter(c => !c.institutionId || c.institutionId === institution.id);
  const instUsers = allUsers.filter(u => !u.institutionId || u.institutionId === institution.id);
  const instAnnouncements = allAnnouncements.filter(a => !a.institutionId || a.institutionId === institution.id);
  const instAssignments = allAssignments.filter(a => !a.institutionId || a.institutionId === institution.id);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotCourseCode.trim() || !slotRoom.trim()) return;

    db.createClassroom({
      institutionId: institution.id,
      roomNumber: slotRoom.trim(),
      building: `${institution.shortName} Hall`,
      capacity: slotCapacity,
      type: 'Lecture Hall',
      equipment: ['Digital Projector', 'Acoustic Audio', 'Dual Smartboards'],
      courseSubject: slotCourseName.trim() || 'Academic Lecture',
      courseCode: slotCourseCode.trim().toUpperCase(),
      teacherName: slotTeacher.trim() || 'Faculty Instructor',
      teacherEmail: `faculty@${institution.domain}`,
      days: slotDays,
      startTime: slotStartTime,
      endTime: slotEndTime,
      notes: `Managed via ${institution.shortName} Admin Details.`
    });

    showToast(`Timetable schedule added for ${slotCourseCode.toUpperCase()} in ${slotRoom}!`);
    setIsAddSlotOpen(false);
    setSlotCourseCode('');
    setSlotCourseName('');
    setSlotRoom('');
  };

  const handleDeleteSlot = (r: Classroom) => {
    if (confirm(`Remove timetable slot and room allocation for "${r.roomNumber}"?`)) {
      db.deleteClassroom(r.id);
      showToast(`Schedule slot removed.`);
    }
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    db.createClassroom({
      institutionId: institution.id,
      roomNumber: roomNumber.trim(),
      building: roomBuilding.trim() || `${institution.shortName} Science Complex`,
      capacity: Number(roomCapacity) || 40,
      type: roomType,
      equipment: ['Projector', 'Fiber LAN', 'Audio System'],
      courseSubject: '',
      courseCode: '',
      teacherName: 'Unassigned',
      days: ['Monday', 'Wednesday'],
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      notes: `Provisioned for ${institution.name}.`
    });

    showToast(`Classroom ${roomNumber.trim()} added.`);
    setIsAddRoomOpen(false);
    setRoomNumber('');
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseName.trim()) return;

    db.createClass({
      institutionId: institution.id,
      code: newCourseCode.trim().toUpperCase(),
      name: newCourseName.trim(),
      section: newCourseSection.trim(),
      semester: 'Fall 2026',
      teacherId: 'teacher-1',
      teacherName: 'Faculty Instructor',
      teacherEmail: `faculty@${institution.domain}`,
      room: instRooms[0]?.roomNumber || 'Room 101',
      schedule: 'Mon & Wed 10:00 AM - 11:30 AM',
      color: 'indigo',
      description: `Course offering at ${institution.name}.`
    });

    showToast(`Course ${newCourseCode.toUpperCase()} added to catalog.`);
    setIsAddCourseOpen(false);
    setNewCourseCode('');
    setNewCourseName('');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    db.createUser({
      id: `user-${Date.now()}`,
      institutionId: institution.id,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      department: newUserDept.trim(),
      password: newUserRole === 'teacher' ? 'faculty123' : 'student123',
      studentId: newUserRole === 'student' ? `${institution.code}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      facultyId: newUserRole === 'teacher' ? `${institution.code}-FAC-${Math.floor(100 + Math.random() * 900)}` : undefined,
      title: newUserRole === 'teacher' ? 'Faculty Instructor' : undefined
    });

    showToast(`User ${newUserName.trim()} registered to ${institution.shortName}.`);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BREADCRUMB & BACK ACTION */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-indigo-500" />
          <span>&larr; Back to All Institutions Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenPrincipalWindow(institution)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md shadow-amber-500/25 transition-all cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-slate-950" />
            <span>Open Principal Control Window</span>
          </button>
        </div>
      </div>

      {/* INSTITUTION HERO HEADER CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-white shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center font-black text-white text-2xl shadow-lg shrink-0 font-['Space_Grotesk']">
              {institution.logoText || institution.code.slice(0, 3)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black font-['Space_Grotesk'] tracking-tight text-white">
                  {institution.name}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {institution.licenseTier}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active License
                </span>
              </div>
              <p className="text-xs text-slate-300 italic">{institution.tagline || 'Excellence in Higher Education & Research'}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap pt-1">
                <span>Code: <strong>{institution.code}</strong></span>
                <span>&bull;</span>
                <span>Domain: <strong>{institution.domain}</strong></span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  {institution.location}
                </span>
                <span>&bull;</span>
                <span>Faculty SV-Code: <strong className="text-amber-400">{institution.staffVerificationCode}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => onSwitchCampus(institution.id)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
            >
              Switch Active Campus
            </button>
            <button
              type="button"
              onClick={() => onOpenHandover(institution)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-300" />
              <span>Handover Dossier</span>
            </button>
          </div>
        </div>

        {/* Principal Leadership Contact Strip */}
        <div className="pt-4 border-t border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-200">
            <School className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Institutional Principal Lead:</strong> {institution.principalName || 'Dr. Evelyn Montgomery'} &bull; {institution.principalTitle || 'Principal & Academic Dean'} (<code>{institution.principalEmail || `principal@${institution.domain}`}</code>)
            </span>
          </div>

          <div className="text-[11px] text-slate-300 flex items-center gap-2">
            <span>Admin Contact: {institution.contactAdminName} ({institution.contactAdminEmail})</span>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS FOR THIS SPECIFIC INSTITUTION */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Timetable Slots</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{instRooms.length}</p>
          <span className="text-[10px] text-slate-400">Scheduled Sessions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lecture Halls</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{instRooms.length}</p>
          <span className="text-[10px] text-slate-400">Physical Rooms</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Courses</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{instCourses.length}</p>
          <span className="text-[10px] text-slate-400">Curriculum Offerings</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faculty Members</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {instUsers.filter(u => u.role === 'teacher').length || 2}
          </p>
          <span className="text-[10px] text-slate-400">Instructors</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Body</span>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {instUsers.filter(u => u.role === 'student').length || 10}
          </p>
          <span className="text-[10px] text-slate-400">Enrolled Users</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bulletins</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{instAnnouncements.length}</p>
          <span className="text-[10px] text-slate-400">Official Notices</span>
        </div>
      </div>

      {/* SEGMENTED DETAILS SUB-TABS */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'schedules'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
          onClick={() => setActiveTab('classrooms')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'classrooms'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <School className="w-3.5 h-3.5" />
          <span>Classrooms & Facilities</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300 dark:bg-slate-700">
            {instRooms.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'courses'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Courses & Catalog</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300 dark:bg-slate-700">
            {instCourses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'roster'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'announcements'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Announcements</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300 dark:bg-slate-700">
            {instAnnouncements.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'assignments'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Assignments & Projects</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300 dark:bg-slate-700">
            {instAssignments.length}
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: SCHEDULES & TIMETABLES */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Institutional Timetable Matrix & Lecture Slots
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Weekly scheduling, room reservations, and faculty time blocks for {institution.name}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddSlotOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Timetable Slot</span>
              </button>
            </div>
          </div>

          {/* Day Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-2">Filter Day:</span>
            {['All', ...daysOfWeek].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedDay === day
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Timetable List Grid */}
          <div className="space-y-3">
            {instRooms
              .filter(r => selectedDay === 'All' || r.days.includes(selectedDay))
              .map((room) => (
                <div
                  key={room.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
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

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(room)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
                      title="Remove Timetable Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

            {instRooms.length === 0 && (
              <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Timetable Sessions Scheduled</p>
                <p className="text-xs text-slate-500">Click "Add Timetable Slot" to schedule classes for {institution.shortName}.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CLASSROOMS & FACILITIES */}
      {activeTab === 'classrooms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Physical Lecture Halls & Campus Facilities
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Auditoriums, computer labs, and seminar halls provisioned for {institution.name}.
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
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{room.roomNumber}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{room.building}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {room.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 py-2 border-y border-slate-100 dark:border-slate-800 my-2">
                    <span>Capacity: <strong>{room.capacity} seats</strong></span>
                    <span>&bull;</span>
                    <span>Course: <strong>{room.courseCode || 'Unassigned'}</strong></span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {room.equipment.map((eq, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    {room.days.join(' & ')} {room.startTime}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete room ${room.roomNumber}?`)) {
                        db.deleteClassroom(room.id);
                        showToast(`Classroom deleted.`);
                      }
                    }}
                    className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COURSES & CURRICULUM */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Academic Courses & Curriculum Catalog
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accredited courses taught at {institution.name}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddCourseOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instCourses.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {c.code}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{c.name}</h4>
                      <p className="text-xs text-slate-500">{c.section} &bull; {c.semester}</p>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Join: {c.joinCode}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 my-2 py-2 border-y border-slate-100 dark:border-slate-800 font-mono">
                    <div>Instructor: <strong>{c.teacherName}</strong></div>
                    <div>Room: <strong>{c.room}</strong></div>
                    <div>Schedule: <strong>{c.schedule}</strong></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {c.enrolledStudentCount} Enrolled students
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete course ${c.code}?`)) {
                        db.deleteClass(c.id);
                        showToast(`Course deleted.`);
                      }
                    }}
                    className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: FACULTY & STUDENT ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Institutional Directory & Campus Roster
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Staff, instructors, students, and executive principal for {institution.name}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddUserOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>

          <div className="space-y-2">
            {instUsers.map((u) => (
              <div
                key={u.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
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
                          : u.role === 'admin'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
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
                    ID: {u.studentId || u.facultyId || u.adminId || u.principalId || 'N/A'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove ${u.name}?`)) {
                        db.deleteUser(u.id);
                        showToast(`User removed.`);
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                    title="Remove user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Campus Announcements & Bulletins
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official broadcasts for {institution.name}.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {instAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ann.title}</h4>
                    <p className="text-xs text-slate-500">
                      By {ann.authorName} &bull; {new Date(ann.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete announcement?`)) {
                        db.deleteAnnouncement(ann.id);
                        showToast(`Announcement deleted.`);
                      }
                    }}
                    className="text-rose-600 hover:text-rose-700 text-xs font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{ann.content}</p>
              </div>
            ))}

            {instAnnouncements.length === 0 && (
              <p className="text-xs text-slate-400 italic">No announcements posted for this institution yet.</p>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Academic Deliverables & Assignments
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active assignments and coursework for students at {institution.name}.
            </p>
          </div>

          <div className="space-y-3">
            {instAssignments.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{a.title}</h4>
                  <p className="text-xs text-slate-500">Due: {new Date(a.dueDate).toLocaleDateString()} &bull; {a.points} Points</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {db.getSubmissions(a.id).length} submissions
                </span>
              </div>
            ))}

            {instAssignments.length === 0 && (
              <p className="text-xs text-slate-400 italic">No assignments active for this institution.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD TIMETABLE SLOT */}
      {isAddSlotOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Add Timetable Slot for {institution.shortName}
            </h4>

            <form onSubmit={handleAddSlot} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={slotCourseCode}
                    onChange={(e) => setSlotCourseCode(e.target.value)}
                    placeholder="CS201"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room Allocation</label>
                  <input
                    type="text"
                    required
                    value={slotRoom}
                    onChange={(e) => setSlotRoom(e.target.value)}
                    placeholder="Turing Hall 304"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Subject Name</label>
                <input
                  type="text"
                  required
                  value={slotCourseName}
                  onChange={(e) => setSlotCourseName(e.target.value)}
                  placeholder="Data Structures & Algorithms"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Faculty Instructor</label>
                <input
                  type="text"
                  required
                  value={slotTeacher}
                  onChange={(e) => setSlotTeacher(e.target.value)}
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
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
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

      {/* MODAL: ADD ROOM */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <School className="w-4 h-4 text-indigo-500" />
              Add Room for {institution.shortName}
            </h4>

            <form onSubmit={handleAddRoom} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room Identifier</label>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Main Hall 101"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
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
                    <option value="Seminar Room">Seminar Room</option>
                  </select>
                </div>
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
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Add Course to {institution.shortName}
            </h4>

            <form onSubmit={handleAddCourse} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="ENG101"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section</label>
                  <input
                    type="text"
                    value={newCourseSection}
                    onChange={(e) => setNewCourseSection(e.target.value)}
                    placeholder="Section 01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Introduction to Software Systems"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
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
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Add Member to {institution.shortName}
            </h4>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Prof. James Vance"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder={`j.vance@${institution.domain}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    <option value="teacher">Faculty Instructor</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    placeholder="Applied Computing"
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
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
