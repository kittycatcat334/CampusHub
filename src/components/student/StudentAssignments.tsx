import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Assignment, UniversityClass } from '../../types';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  Calendar,
  Layers,
  ArrowRight,
  BookOpen,
  Radio,
  Hourglass,
  Timer,
  FileCheck2,
  Sparkles,
  ChevronDown,
  X,
  UploadCloud,
  FileText
} from 'lucide-react';

interface StudentAssignmentsProps {
  onSelectAssignment: (assignment: Assignment) => void;
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string | null) => void;
}

export const StudentAssignments: React.FC<StudentAssignmentsProps> = ({
  onSelectAssignment,
  selectedCourseId,
  onSelectCourse
}) => {
  const { currentUser } = useAuth();

  const [selectedClassId, setSelectedClassId] = useState<string>(selectedCourseId || 'all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'today' | 'near' | 'week' | 'submitted' | 'reviewed' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'submission-date' | 'course' | 'points'>('submission-date');

  // Keep in sync with prop if changed externally
  useEffect(() => {
    if (selectedCourseId) {
      setSelectedClassId(selectedCourseId);
    }
  }, [selectedCourseId]);

  const enrolledClasses = db.getStudentClasses(currentUser.id);
  const enrolledClassIds = new Set(enrolledClasses.map(c => c.id));
  const allAssignments = db.getAssignments().filter(a => enrolledClassIds.has(a.classId));
  const submissions = db.getSubmissions().filter(s => s.studentId === currentUser.id);
  const submissionMap = new Map(submissions.map(s => [s.assignmentId, s]));
  const classMap = new Map(enrolledClasses.map(c => [c.id, c]));

  // Reference time: 2026-09-17 12:45:00
  const refDate = new Date('2026-09-17T12:45:00');

  // Evaluate real-time urgency on each assignment
  const assignmentsWithUrgency = allAssignments.map(assignment => {
    const submission = submissionMap.get(assignment.id);
    const urgency = db.getAssignmentRealTimeUrgency(assignment.dueDate);
    const course = classMap.get(assignment.classId);

    return {
      assignment,
      submission,
      urgency,
      course,
      dueDateObj: new Date(assignment.dueDate)
    };
  });

  // Calculate real-time stats
  const activeUnsubmitted = assignmentsWithUrgency.filter(item => !item.submission);
  const dueTodayItems = activeUnsubmitted.filter(item => item.urgency.urgency === 'urgent');
  const due48hItems = activeUnsubmitted.filter(item => item.urgency.urgency === 'near');
  const dueThisWeekItems = activeUnsubmitted.filter(item => item.urgency.urgency === 'this-week');
  const overdueItems = activeUnsubmitted.filter(item => item.urgency.urgency === 'overdue');
  const submittedItems = assignmentsWithUrgency.filter(item => item.submission && item.submission.status === 'submitted');
  const reviewedItems = assignmentsWithUrgency.filter(item => item.submission && item.submission.status === 'reviewed');

  // Find next immediate cutoff
  const pendingByDueDate = [...activeUnsubmitted].sort((a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime());
  const nextCutoffItem = pendingByDueDate.length > 0 ? pendingByDueDate[0] : null;

  // Filter items
  const filteredItems = assignmentsWithUrgency.filter(item => {
    // Course filter
    if (selectedClassId !== 'all' && item.assignment.classId !== selectedClassId) {
      return false;
    }

    // Urgency filter
    if (urgencyFilter === 'today') {
      if (item.submission || item.urgency.urgency !== 'urgent') return false;
    } else if (urgencyFilter === 'near') {
      if (item.submission || item.urgency.urgency !== 'near') return false;
    } else if (urgencyFilter === 'week') {
      if (item.submission || (item.urgency.urgency !== 'this-week' && item.urgency.urgency !== 'near' && item.urgency.urgency !== 'urgent')) return false;
    } else if (urgencyFilter === 'submitted') {
      if (!item.submission || item.submission.status !== 'submitted') return false;
    } else if (urgencyFilter === 'reviewed') {
      if (!item.submission || item.submission.status !== 'reviewed') return false;
    } else if (urgencyFilter === 'overdue') {
      if (item.submission || item.urgency.urgency !== 'overdue') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.assignment.title.toLowerCase().includes(q);
      const matchDesc = item.assignment.description.toLowerCase().includes(q);
      const matchCourse = item.course ? (item.course.name.toLowerCase().includes(q) || item.course.code.toLowerCase().includes(q)) : false;
      if (!matchTitle && !matchDesc && !matchCourse) return false;
    }

    return true;
  });

  // Sorting
  filteredItems.sort((a, b) => {
    if (sortBy === 'submission-date') {
      // Pending first (sorted by due date), submitted/reviewed last
      if (!a.submission && b.submission) return -1;
      if (a.submission && !b.submission) return 1;
      return a.dueDateObj.getTime() - b.dueDateObj.getTime();
    }
    if (sortBy === 'points') {
      return b.assignment.points - a.assignment.points;
    }
    if (sortBy === 'course') {
      const codeA = a.course?.code || '';
      const codeB = b.course?.code || '';
      return codeA.localeCompare(codeB);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Space_Grotesk']">
              Assignments & Deliverables
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Real-Time Submission Timers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking according to exact submission deadlines, cutoffs, and grading reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            {activeUnsubmitted.length} Pending Submission{activeUnsubmitted.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* REAL-TIME SUBMISSION CUTOFF HERO BANNER */}
      {nextCutoffItem && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg border border-indigo-800/40 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30 animate-pulse">
                  <Radio className="w-3 h-3 text-rose-400" />
                  Next Immediate Submission Cutoff
                </span>
                <span className="text-xs text-slate-300">
                  {nextCutoffItem.course?.code} • {nextCutoffItem.course?.name}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Space_Grotesk']">
                {nextCutoffItem.assignment.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1 text-rose-300 font-bold">
                  <Clock className="w-4 h-4" />
                  Deadline: {new Date(nextCutoffItem.assignment.dueDate).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
                <span>•</span>
                <span>Category: {nextCutoffItem.assignment.category || 'Homework'}</span>
                <span>•</span>
                <span>Worth: {nextCutoffItem.assignment.points} Points</span>
              </div>
            </div>

            {/* Live Countdown & Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  Time Remaining
                </span>
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
                  {nextCutoffItem.urgency.text}
                </span>
              </div>

              <button
                onClick={() => onSelectAssignment(nextCutoffItem.assignment)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-5 py-3.5 rounded-xl shadow-md transition-all text-xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Submit Deliverable Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URGENCY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setUrgencyFilter('all')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            urgencyFilter === 'all'
              ? 'bg-indigo-50 border-indigo-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-500 block">All Deliverables</span>
          <span className="text-xl font-black text-slate-900">{allAssignments.length}</span>
        </button>

        <button
          onClick={() => setUrgencyFilter('today')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            urgencyFilter === 'today'
              ? 'bg-rose-50 border-rose-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-rose-600 block flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            Due Today
          </span>
          <span className="text-xl font-black text-rose-700">{dueTodayItems.length}</span>
        </button>

        <button
          onClick={() => setUrgencyFilter('near')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            urgencyFilter === 'near'
              ? 'bg-amber-50 border-amber-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-amber-600 block">Due in 48h</span>
          <span className="text-xl font-black text-amber-700">{due48hItems.length}</span>
        </button>

        <button
          onClick={() => setUrgencyFilter('week')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            urgencyFilter === 'week'
              ? 'bg-sky-50 border-sky-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-sky-600 block">Due This Week</span>
          <span className="text-xl font-black text-sky-700">{dueThisWeekItems.length + due48hItems.length + dueTodayItems.length}</span>
        </button>

        <button
          onClick={() => setUrgencyFilter('submitted')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            urgencyFilter === 'submitted'
              ? 'bg-emerald-50 border-emerald-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-600 block">Submitted</span>
          <span className="text-xl font-black text-emerald-700">{submittedItems.length}</span>
        </button>

        <button
          onClick={() => setUrgencyFilter('reviewed')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            urgencyFilter === 'reviewed'
              ? 'bg-purple-50 border-purple-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-purple-600 block">Graded & Feedback</span>
          <span className="text-xl font-black text-purple-700">{reviewedItems.length}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by assignment title, instructions, or course..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Course filter dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedClassId}
              onChange={e => {
                const val = e.target.value;
                setSelectedClassId(val);
                if (onSelectCourse) onSelectCourse(val === 'all' ? null : val);
              }}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Enrolled Courses</option>
              {enrolledClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="submission-date">Sort: Due Date (Urgent First)</option>
              <option value="points">Sort: Points (High to Low)</option>
              <option value="course">Sort: Course Code</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No assignments match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try resetting your filters or search keywords to view all course deliverables.
          </p>
          <button
            onClick={() => {
              setUrgencyFilter('all');
              setSelectedClassId('all');
              setSearchQuery('');
              if (onSelectCourse) onSelectCourse(null);
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(({ assignment, submission, urgency, course }) => {
            const isSubmitted = !!submission;
            const isReviewed = submission?.status === 'reviewed';

            return (
              <div
                key={assignment.id}
                onClick={() => onSelectAssignment(assignment)}
                className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                {/* Left info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {course?.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {course?.name}
                    </span>

                    {/* REAL-TIME SUBMISSION DATE BADGE */}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border inline-flex items-center gap-1 ${urgency.badgeColor}`}>
                      <Clock className="w-3 h-3" />
                      <span>{urgency.text}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {assignment.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {assignment.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="font-semibold text-slate-600">
                      Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                    <span>•</span>
                    <span>{assignment.points} Maximum Points</span>
                    {assignment.attachments && assignment.attachments.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-600 font-semibold inline-flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {assignment.attachments.length} starter file{assignment.attachments.length > 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Status & Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                  {isReviewed ? (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        <Award className="w-3.5 h-3.5" />
                        Graded: {submission.grade}/{assignment.points}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">Feedback available</span>
                    </div>
                  ) : isSubmitted ? (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Submitted on Time
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">Pending instructor review</span>
                    </div>
                  ) : (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectAssignment(assignment);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                    >
                      <span>Submit Work</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
