import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, subscribeToDB } from '../../services/db';
import { DailyClassScheduleItem, PersonalScheduleItem } from '../../types';
import { ScheduleItemModal } from '../schedule/ScheduleItemModal';
import { AcademicNotesManager } from '../notes/AcademicNotesManager';
import {
  Clock,
  MapPin,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Radio,
  Hourglass,
  CalendarDays,
  LayoutGrid,
  ListFilter,
  Printer,
  Mail,
  FileCheck2,
  Plus,
  Edit3,
  Trash2,
  FileText,
  CheckSquare,
  Square
} from 'lucide-react';

interface StudentDailyScheduleProps {
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string | null) => void;
  onNavigate?: (tab: string) => void;
  compact?: boolean;
}

const DAYS_OF_WEEK = [
  { id: 'Monday', label: 'Mon', full: 'Monday' },
  { id: 'Tuesday', label: 'Tue', full: 'Tuesday' },
  { id: 'Wednesday', label: 'Wed', full: 'Wednesday' },
  { id: 'Thursday', label: 'Thu', full: 'Thursday', isToday: true },
  { id: 'Friday', label: 'Fri', full: 'Friday' }
];

export const StudentDailySchedule: React.FC<StudentDailyScheduleProps> = ({
  selectedCourseId,
  onSelectCourse,
  onNavigate,
  compact = false
}) => {
  const { currentUser } = useAuth();

  // Selected Day (defaults to Thursday as current semester day)
  const [selectedDay, setSelectedDay] = useState<string>('Thursday');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [mainTab, setMainTab] = useState<'schedule' | 'notes'>('schedule');

  // Custom Schedule Item Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PersonalScheduleItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Subscribe to DB updates
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribeToDB(() => setTick(t => t + 1));
  }, []);

  if (!currentUser) return null;

  const lectureItems = db.getStudentDailySchedule(currentUser.id, selectedDay);
  const personalItems = db.getPersonalScheduleByDay(currentUser.id, selectedDay);
  const enrolledClasses = db.getStudentClasses(currentUser.id);
  const realTimeStatus = db.getStudentRealTimeClassStatus(currentUser.id);

  // Filter if course selected
  const displayLectures = selectedCourseId
    ? lectureItems.filter(item => item.course.id === selectedCourseId)
    : lectureItems;

  const displayPersonal = selectedCourseId
    ? personalItems.filter(item => item.courseId === selectedCourseId || item.courseCode === enrolledClasses.find(c => c.id === selectedCourseId)?.code)
    : personalItems;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PersonalScheduleItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    db.deletePersonalScheduleItem(id);
    setDeleteConfirmId(null);
  };

  const handleToggleComplete = (id: string) => {
    db.togglePersonalScheduleItemComplete(id);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Space_Grotesk']">
              Student Schedule & Academic Planner
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              Fall 2026 Timetable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track daily lectures, plan study sessions, office hour appointments, and manage personal academic data.
          </p>
        </div>

        {/* View mode toggle and Add button */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Schedule</span>
          </button>

          {mainTab === 'schedule' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'day'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Day View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'week'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Full Week</span>
              </button>
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
            title="Print Schedule"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tabs: Schedule vs Notes */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setMainTab('schedule')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            mainTab === 'schedule'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Daily & Weekly Schedule</span>
        </button>
        <button
          onClick={() => setMainTab('notes')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            mainTab === 'notes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Personal Academic Notes & Data</span>
        </button>
      </div>

      {mainTab === 'notes' ? (
        <AcademicNotesManager initialCourseFilter={selectedCourseId ? enrolledClasses.find(c => c.id === selectedCourseId)?.code : null} />
      ) : (
        <>
          {/* Real-time Indicator Ribbon */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                    Current Academic Session
                  </span>
                  <span className="text-[11px] text-slate-400">• Thursday, Sep 17, 2026 (12:45 PM)</span>
                </div>
                <p className="text-sm font-bold text-white">
                  {realTimeStatus.classesLeftTodayCount > 0 ? (
                    <>
                      You have <span className="text-amber-300">{realTimeStatus.classesLeftTodayCount} classes left today</span>. Next up:{' '}
                      <span className="underline decoration-indigo-400">
                        {realTimeStatus.nextClassToday?.course.code} at {realTimeStatus.nextClassToday?.startTime}
                      </span>{' '}
                      in {realTimeStatus.nextClassToday?.room}.
                    </>
                  ) : (
                    'All lectures for today have concluded.'
                  )}
                </p>
              </div>
            </div>

            {selectedDay !== 'Thursday' && (
              <button
                onClick={() => setSelectedDay('Thursday')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors self-start sm:self-center shrink-0"
              >
                Jump to Today (Thu)
              </button>
            )}
          </div>

          {/* Day-of-the-Week Selector Tabs */}
          <div className="flex items-center overflow-x-auto pb-1 gap-2 border-b border-slate-200">
            {DAYS_OF_WEEK.map(day => {
              const isSelected = selectedDay === day.id;
              const dayClasses = db.getStudentDailySchedule(currentUser.id, day.id);
              const dayPersonal = db.getPersonalScheduleByDay(currentUser.id, day.id);
              const totalItems = dayClasses.length + dayPersonal.length;

              return (
                <button
                  key={day.id}
                  onClick={() => {
                    setSelectedDay(day.id);
                    setViewMode('day');
                  }}
                  className={`flex-1 min-w-[120px] p-3 rounded-xl border text-left transition-all relative ${
                    isSelected && viewMode === 'day'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected && viewMode === 'day' ? 'text-white' : 'text-slate-900'}`}>
                      {day.full}
                    </span>
                    {day.isToday && (
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          isSelected && viewMode === 'day' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Today
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] block mt-1 ${
                      isSelected && viewMode === 'day' ? 'text-indigo-100' : 'text-slate-500'
                    }`}
                  >
                    {totalItems} {totalItems === 1 ? 'event' : 'events'}
                    {dayPersonal.length > 0 && ` (${dayPersonal.length} custom)`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* VIEW: DAY VIEW */}
          {viewMode === 'day' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  {selectedDay}'s Schedule ({displayLectures.length + displayPersonal.length} total commitments)
                </h2>
                {selectedCourseId && onSelectCourse && (
                  <button
                    onClick={() => onSelectCourse(null)}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Clear course filter
                  </button>
                )}
              </div>

              {displayLectures.length === 0 && displayPersonal.length === 0 ? (
                <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 text-base">No events scheduled for {selectedDay}</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    You have no scheduled lectures or personal study sessions on this day. Use the button below to add study blocks, review sessions, or office hour reminders.
                  </p>
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    + Add to Schedule
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* SECTION 1: OFFICIAL LECTURES */}
                  {displayLectures.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                        Official Course Lectures ({displayLectures.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {displayLectures.map(item => {
                          const statusBg =
                            item.status === 'in-progress'
                              ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500'
                              : item.status === 'completed'
                              ? 'border-slate-200 bg-slate-50/70 opacity-80'
                              : 'border-slate-200 bg-white hover:border-indigo-300';

                          return (
                            <div
                              key={item.id}
                              className={`p-4 rounded-xl border transition-all ${statusBg}`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-md text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                                      {item.course.code}
                                    </span>
                                    <span className="text-xs font-bold text-slate-900">
                                      {item.course.name}
                                    </span>
                                    {item.status === 'in-progress' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white animate-pulse">
                                        Live Now
                                      </span>
                                    )}
                                    {item.status === 'completed' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-600">
                                        Finished Today
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-0.5">
                                    <span className="flex items-center gap-1 font-bold text-indigo-700">
                                      <Clock className="w-3.5 h-3.5" />
                                      {item.startTime} - {item.endTime}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                      {item.room}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                      {item.instructorName}
                                    </span>
                                  </div>
                                </div>

                                {onNavigate && (
                                  <button
                                    onClick={() => onNavigate('classes')}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 self-start sm:self-center"
                                  >
                                    <span>Course Stream</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: PERSONAL STUDY & REVIEW SESSIONS */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                        Personal Study, Office Hours & Commitments ({displayPersonal.length})
                      </h3>
                      <button
                        onClick={handleOpenAdd}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add commitment</span>
                      </button>
                    </div>

                    {displayPersonal.length === 0 ? (
                      <div className="p-6 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center">
                        <p className="text-xs text-slate-500">
                          No custom study sessions or reminders for {selectedDay}.
                        </p>
                        <button
                          onClick={handleOpenAdd}
                          className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                        >
                          + Add a study block or office hours visit
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {displayPersonal.map(item => {
                          const colorMap: Record<string, { border: string; bg: string; badge: string; text: string }> = {
                            indigo: { border: 'border-indigo-200', bg: 'bg-indigo-50/30', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', text: 'text-indigo-700' },
                            amber: { border: 'border-amber-200', bg: 'bg-amber-50/30', badge: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-700' },
                            emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50/30', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-700' },
                            sky: { border: 'border-sky-200', bg: 'bg-sky-50/30', badge: 'bg-sky-100 text-sky-800 border-sky-200', text: 'text-sky-700' },
                            purple: { border: 'border-purple-200', bg: 'bg-purple-50/30', badge: 'bg-purple-100 text-purple-800 border-purple-200', text: 'text-purple-700' },
                            rose: { border: 'border-rose-200', bg: 'bg-rose-50/30', badge: 'bg-rose-100 text-rose-800 border-rose-200', text: 'text-rose-700' }
                          };
                          const style = colorMap[item.color || 'indigo'] || colorMap.indigo;

                          return (
                            <div
                              key={item.id}
                              className={`p-4 rounded-xl border ${style.border} ${style.bg} relative transition-all shadow-xs ${
                                item.completed ? 'opacity-60 bg-slate-50 border-slate-200' : ''
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  {/* Completed toggle checkbox */}
                                  <button
                                    onClick={() => handleToggleComplete(item.id)}
                                    className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                                    title={item.completed ? 'Mark incomplete' : 'Mark completed'}
                                  >
                                    {item.completed ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                      <Square className="w-5 h-5 text-slate-400" />
                                    )}
                                  </button>

                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${style.badge}`}>
                                        {item.category.replace('-', ' ').toUpperCase()}
                                      </span>
                                      {item.courseCode && (
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white text-slate-700 border border-slate-200">
                                          {item.courseCode}
                                        </span>
                                      )}
                                      {item.completed && (
                                        <span className="text-[11px] font-bold text-emerald-600">
                                          Completed
                                        </span>
                                      )}
                                    </div>

                                    <h4 className={`text-sm font-black font-['Space_Grotesk'] ${
                                      item.completed ? 'line-through text-slate-500' : 'text-slate-900'
                                    }`}>
                                      {item.title}
                                    </h4>

                                    <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-0.5">
                                      <span className={`flex items-center gap-1 font-bold ${style.text}`}>
                                        <Clock className="w-3.5 h-3.5" />
                                        {item.startTime} - {item.endTime}
                                      </span>
                                      {item.location && (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                          {item.location}
                                        </span>
                                      )}
                                    </div>

                                    {item.description && (
                                      <p className="text-xs text-slate-600 mt-1 italic">
                                        "{item.description}"
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 self-start sm:self-center">
                                  <button
                                    onClick={() => handleOpenEdit(item)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                                    title="Edit commitment"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(item.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Delete commitment"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Delete confirm dialog */}
                              {deleteConfirmId === item.id && (
                                <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center p-4 z-10">
                                  <div className="text-center space-y-2">
                                    <p className="text-xs font-bold text-slate-800">Remove this item from your schedule?</p>
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700"
                                      >
                                        Delete
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold hover:bg-slate-300"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: FULL WEEK MATRIX */}
          {viewMode === 'week' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 font-['Space_Grotesk']">
                  Fall 2026 Weekly Academic Schedule Grid
                </h3>
                <span className="text-xs text-slate-500">Lectures + Custom study blocks</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                {DAYS_OF_WEEK.map(day => {
                  const dayLectures = db.getStudentDailySchedule(currentUser.id, day.id);
                  const dayCustom = db.getPersonalScheduleByDay(currentUser.id, day.id);

                  return (
                    <div key={day.id} className="p-3.5 space-y-3 min-h-[360px] bg-white">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-black text-slate-900">{day.full}</span>
                        {day.isToday && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Today
                          </span>
                        )}
                      </div>

                      {dayLectures.length === 0 && dayCustom.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic py-6 text-center">No sessions</p>
                      ) : (
                        <div className="space-y-2.5">
                          {/* Lectures */}
                          {dayLectures.map(session => (
                            <div
                              key={session.id}
                              className="p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                                  {session.course.code}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 font-mono">
                                  {session.startTime.split(' ')[0]}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                                {session.course.name}
                              </h4>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{session.room}</span>
                              </div>
                            </div>
                          ))}

                          {/* Custom Personal Sessions */}
                          {dayCustom.map(custom => (
                            <div
                              key={custom.id}
                              className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 uppercase">
                                  {custom.category.replace('-', ' ')}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 font-mono">
                                  {custom.startTime.split(' ')[0]}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                                {custom.title}
                              </h4>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Schedule Item Modal */}
      <ScheduleItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => setTick(t => t + 1)}
        itemToEdit={editingItem}
        defaultDay={selectedDay}
      />
    </div>
  );
};
