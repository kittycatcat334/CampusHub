import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, subscribeToDB } from '../../services/db';
import { UniversityClass, PersonalScheduleItem } from '../../types';
import { ScheduleItemModal } from '../schedule/ScheduleItemModal';
import { AcademicNotesManager } from '../notes/AcademicNotesManager';
import {
  Clock,
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  FileText,
  AlertCircle
} from 'lucide-react';

interface TeacherScheduleProps {
  onNavigate?: (tab: string) => void;
}

const DAYS_OF_WEEK = [
  { id: 'Monday', label: 'Mon', full: 'Monday' },
  { id: 'Tuesday', label: 'Tue', full: 'Tuesday' },
  { id: 'Wednesday', label: 'Wed', full: 'Wednesday' },
  { id: 'Thursday', label: 'Thu', full: 'Thursday', isToday: true },
  { id: 'Friday', label: 'Fri', full: 'Friday' }
];

export const TeacherSchedule: React.FC<TeacherScheduleProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [selectedDay, setSelectedDay] = useState<string>('Thursday');
  const [activeTab, setActiveTab] = useState<'timetable' | 'notes'>('timetable');

  // Schedule modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PersonalScheduleItem | null>(null);

  // Edit class schedule modal state
  const [editingClass, setEditingClass] = useState<UniversityClass | null>(null);
  const [classScheduleInput, setClassScheduleInput] = useState('');
  const [classRoomInput, setClassRoomInput] = useState('');

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Force re-render on DB changes
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribeToDB(() => setTick(t => t + 1));
  }, []);

  if (!currentUser) return null;

  const teacherClasses = db.getTeacherClasses(currentUser.id);
  const dailyData = db.getTeacherDailySchedule(currentUser.id, selectedDay);
  const allPersonalItems = db.getPersonalSchedule(currentUser.id);

  // Filter office hours across the entire week
  const weeklyOfficeHours = allPersonalItems.filter(item => item.category === 'office-hours');

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditItem = (item: PersonalScheduleItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    db.deletePersonalScheduleItem(id);
    setDeleteConfirmId(null);
  };

  const handleOpenEditClassSchedule = (cls: UniversityClass) => {
    setEditingClass(cls);
    setClassScheduleInput(cls.schedule);
    setClassRoomInput(cls.room);
  };

  const handleSaveClassSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    db.updateClass(editingClass.id, {
      schedule: classScheduleInput.trim(),
      room: classRoomInput.trim()
    });

    setEditingClass(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Space_Grotesk']">
              Faculty Teaching Schedule & Office Hours
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Fall 2026 Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your daily course lectures, student drop-in office hours, and review sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Office Hours / Session</span>
          </button>
        </div>
      </div>

      {/* Main Tabs: Timetable vs Lesson Plan Notes */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('timetable')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'timetable'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Teaching Timetable & Commitments</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'notes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Faculty Lesson Plans & Notes</span>
        </button>
      </div>

      {activeTab === 'notes' ? (
        <AcademicNotesManager />
      ) : (
        <>
          {/* Day of Week Selector */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {DAYS_OF_WEEK.map(d => {
                const isSelected = selectedDay === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDay(d.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{d.label}</span>
                    <span className="hidden sm:inline font-medium text-[11px] opacity-80">
                      ({d.full})
                    </span>
                    {d.isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Today" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-medium hidden md:block">
              Showing commitments for <strong className="text-slate-800">{selectedDay}</strong>
            </div>
          </div>

          {/* Schedule List for Selected Day */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Day commitments */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-['Space_Grotesk']">
                  {selectedDay}'s Schedule ({dailyData.totalCommitments} events)
                </h3>
                <button
                  onClick={handleOpenAdd}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add slot</span>
                </button>
              </div>

              {dailyData.totalCommitments === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-800 text-sm">No scheduled events on {selectedDay}</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You have no scheduled lectures or office hours for this day. You can add office hours or extra review sessions anytime.
                  </p>
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700"
                  >
                    Add Office Hours / Session
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Official course lectures */}
                  {dailyData.lectures.map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-indigo-100 bg-white shadow-xs hover:border-indigo-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              {item.course.code}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                              Lecture
                            </span>
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {item.course.enrolledStudentCount || 0} students
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 font-['Space_Grotesk']">
                            {item.course.name}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                            <span className="flex items-center gap-1 text-indigo-700 font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              {item.startTime} - {item.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {item.room}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <button
                            onClick={() => handleOpenEditClassSchedule(item.course)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Modify Schedule</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Personal Schedule blocks (office hours, extra reviews, meetings) */}
                  {dailyData.personalBlocks.map(item => {
                    const colorMap: Record<string, { bg: string; border: string; badge: string; text: string }> = {
                      purple: { bg: 'bg-purple-50/40', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800 border-purple-200', text: 'text-purple-700' },
                      emerald: { bg: 'bg-emerald-50/40', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-700' },
                      amber: { bg: 'bg-amber-50/40', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-700' },
                      rose: { bg: 'bg-rose-50/40', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-800 border-rose-200', text: 'text-rose-700' },
                      sky: { bg: 'bg-sky-50/40', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-800 border-sky-200', text: 'text-sky-700' },
                      indigo: { bg: 'bg-indigo-50/40', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', text: 'text-indigo-700' }
                    };
                    const styling = colorMap[item.color || 'indigo'] || colorMap.indigo;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border ${styling.border} ${styling.bg} shadow-xs relative transition-all`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${styling.badge}`}>
                                {item.category.replace('-', ' ').toUpperCase()}
                              </span>
                              {item.courseCode && (
                                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white text-slate-700 border border-slate-200">
                                  {item.courseCode}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-black text-slate-900 font-['Space_Grotesk']">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                              <span className={`flex items-center gap-1 font-bold ${styling.text}`}>
                                <Clock className="w-3.5 h-3.5" />
                                {item.startTime} - {item.endTime}
                              </span>
                              {item.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
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

                          <div className="flex items-center gap-1 self-start sm:self-center">
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                              title="Edit slot"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Delete confirmation overlay */}
                        {deleteConfirmId === item.id && (
                          <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center p-4 z-10">
                            <div className="text-center space-y-2">
                              <p className="text-xs font-bold text-slate-800">Remove this schedule item?</p>
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

            {/* Right 1 col: Weekly Office Hours & Course Roster Sidebar */}
            <div className="space-y-6">
              {/* Office Hours Summary Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 font-['Space_Grotesk']">
                    Weekly Office Hours
                  </h3>
                  <button
                    onClick={handleOpenAdd}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    + Add Slot
                  </button>
                </div>

                {weeklyOfficeHours.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No office hours configured yet. Add weekly drop-in hours so students know when to reach you.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {weeklyOfficeHours.map(oh => (
                      <div
                        key={oh.id}
                        className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="text-xs font-black text-purple-900 block">
                            {oh.dayOfWeek}: {oh.startTime} - {oh.endTime}
                          </span>
                          <span className="text-[11px] text-purple-700 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {oh.location || 'Faculty Office'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenEditItem(oh)}
                          className="text-slate-400 hover:text-purple-800"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* All Assigned Classes Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 font-['Space_Grotesk']">
                    Your Assigned Classes
                  </h3>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('classes')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Manage
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {teacherClasses.map(cls => (
                    <div
                      key={cls.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900">{cls.code}</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                            {cls.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{cls.schedule}</span>
                          <span>•</span>
                          <span>{cls.room}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenEditClassSchedule(cls)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title="Edit schedule timing or room"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Schedule Item Modal (Office hours & custom sessions) */}
      <ScheduleItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => setTick(t => t + 1)}
        itemToEdit={editingItem}
        defaultDay={selectedDay}
      />

      {/* Quick Edit Class Schedule Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-black text-slate-900 font-['Space_Grotesk']">
              Update Class Schedule & Room
            </h3>
            <p className="text-xs text-slate-500">
              Editing official timetable for <strong className="text-slate-800">{editingClass.code} - {editingClass.name}</strong>
            </p>

            <form onSubmit={handleSaveClassSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lecture Days & Hours <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={classScheduleInput}
                  onChange={e => setClassScheduleInput(e.target.value)}
                  placeholder="e.g., Mon, Wed 10:00 AM - 11:30 AM"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lecture Hall / Classroom <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={classRoomInput}
                  onChange={e => setClassRoomInput(e.target.value)}
                  placeholder="e.g., Turing Lecture Hall 304"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
