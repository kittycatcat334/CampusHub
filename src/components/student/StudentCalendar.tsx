import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Assignment } from '../../types';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon,
  Filter,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';

interface StudentCalendarProps {
  onSelectAssignment: (assignment: Assignment) => void;
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string | null) => void;
}

export const StudentCalendar: React.FC<StudentCalendarProps> = ({
  onSelectAssignment,
  selectedCourseId,
  onSelectCourse
}) => {
  const { currentUser } = useAuth();
  const enrolledClasses = db.getStudentClasses(currentUser.id);
  const enrolledClassIds = new Set(enrolledClasses.map(c => c.id));
  const assignments = db.getAssignments().filter(a => enrolledClassIds.has(a.classId));
  const submissions = db.getSubmissions().filter(s => s.studentId === currentUser.id);
  const submissionMap = new Map(submissions.map(s => [s.assignmentId, s]));
  const classMap = new Map(enrolledClasses.map(c => [c.id, c]));

  // Selected course filter
  const [courseFilter, setCourseFilter] = useState<string>(selectedCourseId || 'all');

  // Default to September 2026 (matching system timestamp)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 is September (0-indexed)
  const [selectedDay, setSelectedDay] = useState<number | null>(17); // Sept 17, 2026

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Filter assignments by selected course
  const filteredAssignments = courseFilter === 'all'
    ? assignments
    : assignments.filter(a => a.classId === courseFilter);

  // Calendar math
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Map assignments by day in currentMonth/currentYear
  const assignmentsByDay = new Map<number, Assignment[]>();
  filteredAssignments.forEach(a => {
    const d = new Date(a.dueDate);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      const day = d.getDate();
      if (!assignmentsByDay.has(day)) {
        assignmentsByDay.set(day, []);
      }
      assignmentsByDay.get(day)!.push(a);
    }
  });

  // Selected day items
  const selectedDayAssignments = selectedDay ? (assignmentsByDay.get(selectedDay) || []) : [];

  // All deadlines sorted chronologically
  const allChronological = [...filteredAssignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Space_Grotesk']">
              Deadlines & Academic Calendar
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              <CalendarDays className="w-3.5 h-3.5" />
              Calendar Deadlines View
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual calendar tracking all assignment due dates, quiz cutoffs, and submission milestones.
          </p>
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={courseFilter}
            onChange={e => {
              setCourseFilter(e.target.value);
              if (onSelectCourse) onSelectCourse(e.target.value === 'all' ? null : e.target.value);
            }}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Enrolled Courses ({enrolledClasses.length})</option>
            {enrolledClasses.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.code} - {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View (2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                {monthNames[currentMonth]} {currentYear}
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentYear(2026);
                  setCurrentMonth(8);
                  setSelectedDay(17);
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-slate-100 text-slate-600"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-xs py-2 border-b border-slate-100">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[76px] sm:min-h-[92px] bg-slate-50/50 rounded-xl p-1.5 opacity-40" />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isToday = currentYear === 2026 && currentMonth === 8 && dayNum === 17;
              const isSelected = selectedDay === dayNum;
              const dayAssignments = assignmentsByDay.get(dayNum) || [];

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`min-h-[76px] sm:min-h-[92px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : isToday
                      ? 'border-indigo-300 bg-indigo-50/20'
                      : 'border-slate-100 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isSelected
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayAssignments.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>

                  {/* Day Tasks Pill */}
                  <div className="space-y-1 mt-1">
                    {dayAssignments.slice(0, 2).map(a => {
                      const course = classMap.get(a.classId);
                      const sub = submissionMap.get(a.id);
                      return (
                        <div
                          key={a.id}
                          className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded truncate border ${
                            sub
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                          title={`${course?.code}: ${a.title}`}
                        >
                          {course?.code}
                        </div>
                      );
                    })}
                    {dayAssignments.length > 2 && (
                      <span className="text-[9px] font-bold text-slate-400 pl-1">
                        +{dayAssignments.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day / Upcoming Deadlines Panel (1 column) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {selectedDay
                  ? `${monthNames[currentMonth]} ${selectedDay}, ${currentYear}`
                  : 'Selected Date'}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {selectedDayAssignments.length} {selectedDayAssignments.length === 1 ? 'Deadline' : 'Deadlines'}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {selectedDayAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-600">No deadlines scheduled for this date.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Click on dates with indicator dots to inspect deadlines.</p>
                </div>
              ) : (
                selectedDayAssignments.map(a => {
                  const course = classMap.get(a.classId);
                  const sub = submissionMap.get(a.id);
                  const due = new Date(a.dueDate);
                  const urgency = db.getAssignmentRealTimeUrgency(a.dueDate);

                  return (
                    <div
                      key={a.id}
                      onClick={() => onSelectAssignment(a)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer bg-slate-50/50 hover:bg-white space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {course?.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${urgency.badgeColor}`}>
                          {urgency.text}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                        {a.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {a.description}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400 font-medium">
                          Due: {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {a.points} pts
                        </span>

                        {sub ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Submitted
                          </span>
                        ) : (
                          <span className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
                            Submit <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick All Upcoming Schedule List */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              All Semester Deadlines ({allChronological.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {allChronological.map(item => {
                const course = classMap.get(item.classId);
                const sub = submissionMap.get(item.id);
                const dateStr = new Date(item.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectAssignment(item)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold text-indigo-700 mr-1.5">{course?.code}:</span>
                      <span className="text-slate-800 font-medium truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-semibold text-slate-500">{dateStr}</span>
                      {sub && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
