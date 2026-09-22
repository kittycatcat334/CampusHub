import React, { useState } from 'react';
import { db } from '../../services/db';
import { Classroom } from '../../types';
import {
  School,
  X,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  BookOpen,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit3,
  Monitor,
  Sparkles,
  Maximize2,
  Minimize2,
  Check,
  Building2,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface SetupClassroomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedRoomId?: string | null;
}

const ROOM_TYPES: Classroom['type'][] = [
  'Lecture Hall',
  'Computer Lab',
  'Science Lab',
  'Seminar Room',
  'Auditorium'
];

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const COMMON_EQUIPMENT = [
  'Laser Projector',
  'Dual Smartboards',
  'Audio PA & Lapel Mics',
  'Student Workstations',
  'High-Speed LAN',
  'Zoom Teleconference Rig',
  'Chalkboard / Whiteboard',
  'Safety Eyewash & Fume Hood'
];

export const SetupClassroomsModal: React.FC<SetupClassroomsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  // Form states
  const [roomNumber, setRoomNumber] = useState('');
  const [building, setBuilding] = useState('Alan Turing Computer Science Center');
  const [courseSubject, setCourseSubject] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday']);
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-12-18');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:30 AM');
  const [capacity, setCapacity] = useState<number>(50);
  const [roomType, setRoomType] = useState<Classroom['type']>('Lecture Hall');
  const [equipment, setEquipment] = useState<string[]>(['Laser Projector', 'Audio PA & Lapel Mics']);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const classrooms = db.getClassrooms();
  const teachers = db.getUsers().filter(u => u.role === 'teacher');

  const filteredRooms = classrooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseSubject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedTypeFilter === 'all' || r.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setRoomNumber('');
    setBuilding('Alan Turing Computer Science Center');
    setCourseSubject('');
    setCourseCode('');
    setTeacherName('');
    setTeacherEmail('');
    setSelectedDays(['Monday', 'Wednesday']);
    setStartDate('2026-09-01');
    setEndDate('2026-12-18');
    setStartTime('10:00 AM');
    setEndTime('11:30 AM');
    setCapacity(50);
    setRoomType('Lecture Hall');
    setEquipment(['Laser Projector', 'Audio PA & Lapel Mics']);
    setNotes('');
    setFormError(null);
    setEditingRoomId(null);
  };

  const handleOpenCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEditRoom = (room: Classroom) => {
    setEditingRoomId(room.id);
    setRoomNumber(room.roomNumber);
    setBuilding(room.building);
    setCourseSubject(room.courseSubject);
    setCourseCode(room.courseCode);
    setTeacherName(room.teacherName);
    setTeacherEmail(room.teacherEmail || '');
    setSelectedDays(room.days);
    setStartDate(room.startDate || '2026-09-01');
    setEndDate(room.endDate || '2026-12-18');
    setStartTime(room.startTime);
    setEndTime(room.endTime);
    setCapacity(room.capacity);
    setRoomType(room.type);
    setEquipment(room.equipment);
    setNotes(room.notes || '');
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleToggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleToggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter(e => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const handleSelectTeacherPreset = (tName: string, tEmail: string) => {
    setTeacherName(tName);
    setTeacherEmail(tEmail);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!roomNumber.trim()) {
      setFormError('Please enter a room number or room identifier.');
      return;
    }
    if (!courseSubject.trim()) {
      setFormError('Please enter the course subject taught in this room.');
      return;
    }
    if (!courseCode.trim()) {
      setFormError('Please provide a course code (e.g. CS201).');
      return;
    }
    if (!teacherName.trim()) {
      setFormError('Please specify the teacher or instructor assigned.');
      return;
    }
    if (selectedDays.length === 0) {
      setFormError('Please select at least one day of the week.');
      return;
    }

    try {
      if (editingRoomId) {
        db.updateClassroom(editingRoomId, {
          roomNumber: roomNumber.trim(),
          building: building.trim(),
          courseSubject: courseSubject.trim(),
          courseCode: courseCode.trim().toUpperCase(),
          teacherName: teacherName.trim(),
          teacherEmail: teacherEmail.trim(),
          days: selectedDays,
          startDate,
          endDate,
          startTime,
          endTime,
          capacity: Number(capacity) || 40,
          type: roomType,
          equipment,
          notes: notes.trim()
        });
        setSuccessToast(`Classroom "${roomNumber}" updated successfully!`);
      } else {
        db.createClassroom({
          roomNumber: roomNumber.trim(),
          building: building.trim(),
          courseSubject: courseSubject.trim(),
          courseCode: courseCode.trim().toUpperCase(),
          teacherName: teacherName.trim(),
          teacherEmail: teacherEmail.trim(),
          days: selectedDays,
          startDate,
          endDate,
          startTime,
          endTime,
          capacity: Number(capacity) || 40,
          type: roomType,
          equipment,
          notes: notes.trim()
        });
        setSuccessToast(`Classroom "${roomNumber}" configured and synced!`);
      }

      setIsFormOpen(false);
      resetForm();
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save classroom.');
    }
  };

  const handleDeleteRoom = (roomId: string, roomName: string) => {
    if (confirm(`Are you sure you want to remove classroom "${roomName}"?`)) {
      db.deleteClassroom(roomId);
      setSuccessToast(`Classroom "${roomName}" removed.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // Check potential schedule conflicts
  const getConflictWarning = (room: Classroom) => {
    const overlapping = classrooms.filter(
      r =>
        r.id !== room.id &&
        r.roomNumber.toLowerCase().trim() === room.roomNumber.toLowerCase().trim() &&
        r.days.some(d => room.days.includes(d)) &&
        r.startTime === room.startTime
    );
    return overlapping.length > 0 ? overlapping[0] : null;
  };

  return (
    <div
      id="window-setup-classrooms"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Standalone Window Container */}
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isExpanded
            ? 'w-full h-full max-w-none max-h-none rounded-none'
            : 'w-full max-w-5xl max-h-[92vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Title Bar */}
        <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <School className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
                  University Classroom Setup & Room Scheduler
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                  Separate Window
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Define classrooms, room capacity, course subjects taught, faculty instructors, days, and times
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-toggle-expand-classroom-window"
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={isExpanded ? 'Restore window size' : 'Expand window to full screen'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              id="btn-close-classroom-window"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Close window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shrink-0 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sub-Header Toolbar */}
        <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/50 shrink-0">
          <div className="flex flex-1 items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-classrooms"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by room, subject, teacher, building..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <select
              id="select-filter-room-type"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Room Types</option>
              {ROOM_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-open-add-room-form"
              type="button"
              onClick={handleOpenCreateForm}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 dark:shadow-indigo-950 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Classroom</span>
            </button>
          </div>
        </div>

        {/* Window Content: Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">Total Classrooms</span>
              <p className="text-xl font-black text-indigo-950 dark:text-indigo-100 mt-0.5">{classrooms.length}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
              <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">Computer Labs</span>
              <p className="text-xl font-black text-purple-950 dark:text-purple-100 mt-0.5">
                {classrooms.filter(r => r.type === 'Computer Lab').length}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Total Seating Capacity</span>
              <p className="text-xl font-black text-emerald-950 dark:text-emerald-100 mt-0.5">
                {classrooms.reduce((sum, r) => sum + (r.capacity || 0), 0)} Seats
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50">
              <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-300">Active Teachers Assigned</span>
              <p className="text-xl font-black text-sky-950 dark:text-sky-100 mt-0.5">
                {new Set(classrooms.map(r => r.teacherName)).size} Faculty
              </p>
            </div>
          </div>

          {/* Add / Edit Classroom Form Accordion */}
          {isFormOpen && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-indigo-500/30 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {editingRoomId ? `Edit Classroom "${roomNumber}"` : 'Configure New Classroom & Subject Schedule'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Room Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Room Number / Hall Identifier *
                    </label>
                    <input
                      id="input-room-number"
                      type="text"
                      required
                      placeholder="e.g. Turing Hall 304, Curie Lab 102"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  {/* Building */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Building / Academic Wing *
                    </label>
                    <input
                      id="input-room-building"
                      type="text"
                      required
                      placeholder="e.g. Alan Turing Computer Science Center"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  {/* Room Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Classroom Facility Type
                    </label>
                    <select
                      id="select-room-facility-type"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40"
                    >
                      {ROOM_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Course Subject */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Course Subject Taught Here *
                    </label>
                    <input
                      id="input-course-subject"
                      type="text"
                      required
                      placeholder="e.g. Data Structures & Algorithm Analysis"
                      value={courseSubject}
                      onChange={(e) => setCourseSubject(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  {/* Course Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Course Code (e.g. CS201) *
                    </label>
                    <input
                      id="input-course-code"
                      type="text"
                      required
                      placeholder="e.g. CS201, MATH152, PHYS210"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 font-mono font-bold"
                    />
                  </div>

                  {/* Room Capacity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Room Seating Capacity (Students)
                    </label>
                    <input
                      id="input-room-capacity"
                      type="number"
                      min={5}
                      max={500}
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>

                {/* Teacher Selection & Custom Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Teacher / Faculty Name Assigned *
                      </label>
                      <span className="text-[10px] text-slate-400">Select faculty or type custom</span>
                    </div>
                    <div className="space-y-1.5">
                      <input
                        id="input-teacher-name"
                        type="text"
                        required
                        placeholder="e.g. Dr. Robert Chen or Prof. Sarah Williams"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40"
                      />
                      <div className="flex flex-wrap gap-1">
                        {teachers.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSelectTeacherPreset(t.name, t.email)}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            + {t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Teacher University Email (Optional)
                    </label>
                    <input
                      id="input-teacher-email"
                      type="email"
                      placeholder="e.g. r.chen@university.edu"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>

                {/* Days of Week Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Class Days (Select all applicable) *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map((day) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{day}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      id="input-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      End Date
                    </label>
                    <input
                      id="input-end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Start Time
                    </label>
                    <select
                      id="select-start-time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {['08:00 AM', '09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '11:30 AM', '01:00 PM', '02:00 PM', '03:30 PM', '04:00 PM', '05:00 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      End Time
                    </label>
                    <select
                      id="select-end-time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {['09:30 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:30 PM', '01:00 PM', '02:30 PM', '03:30 PM', '05:00 PM', '05:30 PM', '06:30 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Equipment Checklist */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Room Equipment & Facilities
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {COMMON_EQUIPMENT.map((eq) => {
                      const hasEq = equipment.includes(eq);
                      return (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => handleToggleEquipment(eq)}
                          className={`text-left text-[11px] p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                            hasEq
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-semibold'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${hasEq ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300'}`}>
                            {hasEq && <Check className="w-2.5 h-2.5" />}
                          </span>
                          <span className="truncate">{eq}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Room Notes & Access Instructions (Optional)
                  </label>
                  <input
                    id="input-room-notes"
                    type="text"
                    placeholder="e.g. Keycard required after 6 PM, Tiered auditorium, fiber LAN connections"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-save-classroom-submit"
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all cursor-pointer"
                  >
                    {editingRoomId ? 'Update Classroom' : 'Save & Sync Classroom'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Classroom Cards Grid */}
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <School className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No classrooms found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No rooms match your filter or search criteria. Click &quot;Add New Classroom&quot; above to setup a new room.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRooms.map((room) => {
                const conflict = getConflictWarning(room);
                return (
                  <div
                    key={room.id}
                    className="bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Conflict Alert Banner if any */}
                      {conflict && (
                        <div className="mb-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>
                            Schedule warning: overlaps with <strong>{conflict.courseCode}</strong> ({conflict.startTime})
                          </span>
                        </div>
                      )}

                      {/* Header row: Room Number & Type badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-base text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
                              {room.roomNumber}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              room.type === 'Computer Lab'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                : room.type === 'Science Lab'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            }`}>
                              {room.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                            <span className="truncate">{room.building}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60">
                            <Users className="w-3 h-3 text-slate-400" />
                            <span>{room.capacity} seats</span>
                          </span>
                        </div>
                      </div>

                      {/* Subject Taught & Course Code Banner */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 mb-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Course Subject
                          </span>
                          <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                            {room.courseCode}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                          {room.courseSubject}
                        </h4>
                      </div>

                      {/* Assigned Teacher & Schedule Details */}
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            Instructor: <strong>{room.teacherName}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span>
                            {room.days.join(' & ')} &bull; <strong>{room.startTime} - {room.endTime}</strong>
                          </span>
                        </div>

                        {room.startDate && room.endDate && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>Term: {room.startDate} to {room.endDate}</span>
                          </div>
                        )}
                      </div>

                      {/* Equipment Chips */}
                      {room.equipment && room.equipment.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {room.equipment.map((eq, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {eq}
                            </span>
                          ))}
                        </div>
                      )}

                      {room.notes && (
                        <p className="text-[11px] text-slate-500 italic mb-3">
                          &quot;{room.notes}&quot;
                        </p>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {room.id}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditRoom(room)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-semibold transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                          title="Delete classroom"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Window Footer Status */}
        <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Classroom sync active &bull; Auto-links course subjects & room assignments</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
