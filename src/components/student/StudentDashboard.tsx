import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AcademicWorkItem, Assignment, UniversityClass, Announcement, Submission } from '../../types';
import { StudentDailySchedule } from './StudentDailySchedule';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  BookOpen,
  Megaphone,
  UploadCloud,
  Award,
  Sparkles,
  Layers,
  ChevronRight,
  FileText,
  X,
  Filter
} from 'lucide-react';

interface StudentDashboardProps {
  onSelectAssignment: (assignment: Assignment) => void;
  onNavigate: (tab: string) => void;
  onSelectClass?: (classItem: UniversityClass) => void;
  onOpenJoinModal?: () => void;
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string | null) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSelectAssignment,
  onNavigate,
  onSelectClass,
  onOpenJoinModal,
  selectedCourseId,
  onSelectCourse
}) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  // Evaluate student academic work
  const workSummary = db.getStudentAcademicWork(currentUser.id);
  const enrolledClasses = db.getStudentClasses(currentUser.id);
  const selectedCourse = selectedCourseId ? enrolledClasses.find(c => c.id === selectedCourseId) : null;

  const announcements = db.getAnnouncements().filter(a => {
    if (selectedCourseId) return a.classId === selectedCourseId;
    return enrolledClasses.some(c => c.id === a.classId);
  }).slice(0, 3);

  // Filter urgent pending items: Overdue, Due Today, Due Soon
  const urgentWork = workSummary.items
    .filter(item => !selectedCourseId || item.assignment.classId === selectedCourseId)
    .filter(item =>
      item.urgency === 'overdue' || item.urgency === 'due-today' || item.urgency === 'due-soon'
    );

  // Recently reviewed submissions (with grades and feedback)
  const recentReviewedSubmissions: { submission: Submission; assignment?: Assignment; course?: UniversityClass }[] =
    db.getSubmissions()
      .filter(s => s.studentId === currentUser.id && s.status === 'reviewed')
      .map(sub => {
        const assignment = db.getAssignmentById(sub.assignmentId);
        const course = assignment ? db.getClassById(assignment.classId) : undefined;
        return { submission: sub, assignment, course };
      })
      .slice(0, 3);

  const getUrgencyBadge = (urgency: AcademicWorkItem['urgency'], daysLeft: number) => {
    switch (urgency) {
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Overdue ({Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'day' : 'days'} ago)
          </span>
        );
      case 'due-today':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Due Today
          </span>
        );
      case 'due-soon':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            Due in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            Due in {daysLeft} days
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Submitted
          </span>
        );
    }
  };

  const formatDueTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Course Focus Active Filter Banner */}
      {selectedCourse && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-indigo-900 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold">
                Filtered by: <span className="font-extrabold">{selectedCourse.code}</span> - {selectedCourse.name}
              </p>
              <p className="text-[11px] text-indigo-700">
                Displaying assignments, announcements, and schedules specifically for this course.
              </p>
            </div>
          </div>
          {onSelectCourse && (
            <button
              onClick={() => onSelectCourse(null)}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-200 shadow-xs hover:bg-indigo-50 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Show All Courses</span>
            </button>
          )}
        </div>
      )}

      {/* Core Principle Banner: Immediate answer to "What academic work do I need to deal with?" */}
      <div className={`p-6 rounded-2xl border transition-all ${
        workSummary.overdueCount > 0
          ? 'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-200'
          : workSummary.dueTodayCount > 0
          ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
          : 'bg-gradient-to-r from-indigo-50 via-sky-50 to-slate-50 border-indigo-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Action Summary &bull; Fall Semester 2026
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              {workSummary.totalActive === 0 ? (
                'You have no urgent deadlines pending!'
              ) : (
                <>
                  You have <span className="text-indigo-600 font-black">{workSummary.totalActive}</span> academic{' '}
                  {workSummary.totalActive === 1 ? 'task' : 'tasks'} requiring attention
                </>
              )}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              {workSummary.overdueCount > 0 ? (
                <span className="text-rose-700 font-semibold">
                  Notice: You have {workSummary.overdueCount} overdue submission! Turn in your work as soon as possible.
                </span>
              ) : workSummary.dueTodayCount > 0 ? (
                <span className="text-amber-800 font-semibold">
                  You have {workSummary.dueTodayCount} assignment due before midnight today.
                </span>
              ) : (
                'Keep up the momentum. Below are your closest upcoming deliverables, class announcements, and recent grades.'
              )}
            </p>
          </div>

          <button
            onClick={() => onNavigate('assignments')}
            className="self-start md:self-center inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition-colors whitespace-nowrap"
          >
            <span>View All Assignments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-200/70">
          <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Due in 3 Days</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{workSummary.dueTodayCount + workSummary.dueSoonCount}</p>
          </div>
          <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Overdue</p>
            <p className="text-2xl font-black text-rose-600 mt-0.5">{workSummary.overdueCount}</p>
          </div>
          <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Completed</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{workSummary.completedCount}</p>
          </div>
          <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Enrolled Classes</p>
            <p className="text-2xl font-black text-indigo-900 mt-0.5">{enrolledClasses.length}</p>
          </div>
        </div>
      </div>

      {/* Main Focus: Urgent Academic Work Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">What To Deal With Next</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">Sorted by urgency</span>
        </div>

        {urgentWork.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">All Caught Up!</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              No assignments are due in the next 3 days. Check your upcoming course schedule or review lecture notes.
            </p>
            <button
              onClick={() => onNavigate('assignments')}
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Browse all semester assignments <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {urgentWork.map((item) => (
              <div
                key={item.assignment.id}
                onClick={() => onSelectAssignment(item.assignment)}
                className="group bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {item.course?.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 truncate max-w-[200px]">
                      {item.course?.name}
                    </span>
                    {getUrgencyBadge(item.urgency, item.daysLeft)}
                    {item.assignment.category && (
                      <span className="text-[11px] font-medium text-slate-400">
                        &bull; {item.assignment.category}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {item.assignment.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {item.assignment.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold text-slate-700 flex items-center sm:justify-end gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDueTime(item.assignment.dueDate)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Worth {item.assignment.points} points
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAssignment(item.assignment);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white px-3.5 py-2 rounded-xl transition-all shadow-xs"
                  >
                    <span>Submit</span>
                    <UploadCloud className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Classes Schedule */}
      <StudentDailySchedule
        selectedCourseId={selectedCourseId}
        onSelectCourse={onSelectCourse}
        onNavigate={onNavigate}
      />

      {/* Two Column Grid: Announcements + Recent Grades & Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Announcements */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-base text-slate-900">Recent Class Announcements</h2>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View all
            </button>
          </div>

          {announcements.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No announcements posted yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold text-indigo-700 px-1.5 py-0.5 rounded bg-indigo-50">
                      {ann.classCode}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 leading-snug">{ann.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{ann.content}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium">&mdash; {ann.authorName}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Reviewed Work & Instructor Feedback */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-base text-slate-900">Graded Work & Teacher Feedback</h2>
            </div>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              History
            </button>
          </div>

          {recentReviewedSubmissions.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No graded submissions to display yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">As instructors review your work, scores and feedback appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReviewedSubmissions.map(({ submission, assignment, course }) => (
                <div
                  key={submission.id}
                  onClick={() => assignment && onSelectAssignment(assignment)}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-700">
                      {course?.code} &bull; {assignment?.title}
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {submission.grade} / {assignment?.points || 100} pts
                    </span>
                  </div>

                  {submission.feedback && (
                    <div className="mt-2 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 italic">
                      "{submission.feedback}"
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                    <span>Reviewed by {submission.reviewedBy || 'Instructor'}</span>
                    <span>{submission.reviewedAt ? new Date(submission.reviewedAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enrolled Courses Summary Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-900">My Enrolled Courses</h2>
          </div>
          <div className="flex items-center gap-2">
            {onOpenJoinModal && (
              <button
                onClick={onOpenJoinModal}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg"
              >
                + Join Course
              </button>
            )}
            <button
              onClick={() => onNavigate('classes')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Manage Courses
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {enrolledClasses.map((cls) => {
            const pendingForClass = workSummary.items.filter(
              i => i.course.id === cls.id && i.urgency !== 'completed'
            ).length;

            return (
              <div
                key={cls.id}
                onClick={() => onSelectClass ? onSelectClass(cls) : onNavigate('classes')}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all cursor-pointer bg-slate-50/50 hover:bg-white group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {cls.code}
                  </span>
                  {pendingForClass > 0 ? (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {pendingForClass} pending
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Caught up
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {cls.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{cls.teacherName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{cls.schedule}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
