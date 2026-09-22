import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { DailyClassScheduleItem, UniversityClass } from '../../types';
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
  FileCheck2
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
  if (!currentUser) return null;

  // Selected Day (defaults to Thursday as current semester day)
  const [selectedDay, setSelectedDay] = useState<string>('Thursday');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const scheduleItems = db.getStudentDailySchedule(currentUser.id, selectedDay);
  const enrolledClasses = db.getStudentClasses(currentUser.id);

  // Filter if course selected
  const displayItems = selectedCourseId
    ? scheduleItems.filter(item => item.course.id === selectedCourseId)
    : scheduleItems;

  const realTimeStatus = db.getStudentRealTimeClassStatus(currentUser.id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Space_Grotesk']">
              Daily Class Schedule
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              Fall 2026 Timetable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official class schedule per day of the week with lecture times, lecture halls, and instructor details.
          </p>
        </div>

        {/* View mode toggle (Day vs Week) */}
        <div className="flex items-center gap-2 self-start sm:self-center">
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
              <span>Full Week Matrix</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
            title="Print Schedule"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

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
                {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
              </span>
            </button>
          );
        })}
      </div>

      {/* VIEW: DAY VIEW */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
              {selectedDay}'s Class Schedule ({displayItems.length} Sessions)
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

          {displayItems.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No classes scheduled on {selectedDay}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Enjoy your study block or use this time to catch up on assignments and readings.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayItems.map((item, idx) => {
                const classTasks = db.getAssignments(item.course.id);
                const pendingTasks = classTasks.filter(t => !db.getSubmissionForStudent(t.id, currentUser.id));

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Time Block */}
                      <div className="flex items-center gap-4 md:w-56 shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-mono">
                          <span className="text-xs font-bold leading-tight">
                            {item.startTime.split(' ')[0]}
                          </span>
                          <span className="text-[9px] text-indigo-300 font-bold">
                            {item.startTime.split(' ')[1]}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {item.startTime} - {item.endTime}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            90 Minutes Lecture
                          </span>
                        </div>
                      </div>

                      {/* Course & Room */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {item.course.code}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {item.course.section}
                          </span>
                          {/* Real-time status badge */}
                          {selectedDay === 'Thursday' && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                item.status === 'in-progress'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                                  : item.status === 'upcoming'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 line-through'
                              }`}
                            >
                              {item.status === 'upcoming' ? 'Starts Soon' : item.status}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-base text-slate-900">
                          {item.course.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-semibold text-indigo-700">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            {item.room}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                            {item.instructorName}
                          </span>
                          <span>•</span>
                          <a
                            href={`mailto:${item.instructorEmail}`}
                            className="text-slate-500 hover:text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            {item.instructorEmail}
                          </a>
                        </div>
                      </div>

                      {/* Actions & Tasks */}
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                        {pendingTasks.length > 0 && (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            {pendingTasks.length} pending task{pendingTasks.length > 1 ? 's' : ''}
                          </span>
                        )}

                        {onNavigate && (
                          <button
                            onClick={() => onNavigate('classes')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            <span>Class Hub</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: FULL WEEK TIMETABLE MATRIX */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Weekly Timetable Grid (Monday through Friday)
            </h3>
            <span className="text-xs text-slate-500">All 5 Enrolled Courses</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            {DAYS_OF_WEEK.map(day => {
              const dayItems = db.getStudentDailySchedule(currentUser.id, day.id);

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

                  {dayItems.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-6 text-center">No lectures</p>
                  ) : (
                    <div className="space-y-2.5">
                      {dayItems.map(session => (
                        <div
                          key={session.id}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-colors space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
