import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Assignment, AcademicWorkItem } from '../../types';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  ArrowRight
} from 'lucide-react';

interface TodoViewProps {
  onSelectAssignment: (assignment: Assignment) => void;
  onSelectClass: (classId: string) => void;
}

export const TodoView: React.FC<TodoViewProps> = ({
  onSelectAssignment
}) => {
  const { currentUser, isStudent, isTeacher, isAdmin } = useAuth();
  if (!currentUser) return null;

  // Student sub-tabs: 'assigned' | 'missing' | 'done'
  const [studentTab, setStudentTab] = useState<'assigned' | 'missing' | 'done'>('assigned');
  // Teacher sub-tabs: 'to-review' | 'reviewed'
  const [teacherTab, setTeacherTab] = useState<'to-review' | 'reviewed'>('to-review');
  const [filterClassId, setFilterClassId] = useState<string>('all');

  const userClasses = isStudent
    ? db.getStudentClasses(currentUser.id)
    : (isAdmin ? db.getClasses() : db.getTeacherClasses(currentUser.id));

  // Compute academic work for students
  const academicData = isStudent ? db.getStudentAcademicWork(currentUser.id) : null;
  const allItems = academicData ? academicData.items : [];

  // Filter student items by class
  const filteredItems = filterClassId === 'all'
    ? allItems
    : allItems.filter(item => item.assignment.classId === filterClassId);

  const assignedItems = filteredItems.filter(i => !i.submission && i.urgency !== 'overdue');
  const missingItems = filteredItems.filter(i => !i.submission && i.urgency === 'overdue');
  const doneItems = filteredItems.filter(i => !!i.submission);

  // Teacher submissions
  const submissions = db.getSubmissions();
  const allSubmissions = isTeacher || isAdmin
    ? submissions.filter(s => {
        const a = db.getAssignmentById(s.assignmentId);
        if (!a) return false;
        if (filterClassId !== 'all' && a.classId !== filterClassId) return false;
        if (isAdmin) return true;
        const c = db.getClassById(a.classId);
        return c?.teacherId === currentUser.id;
      })
    : [];

  const toReviewSubmissions = allSubmissions.filter(s => s.status === 'submitted');
  const reviewedSubmissions = allSubmissions.filter(s => s.status === 'reviewed');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-['Space_Grotesk'] flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>{isStudent ? 'To-do List' : 'To-review Work'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isStudent
              ? 'Keep track of all class assignments, deadlines, and grades in one place.'
              : 'Review submitted student coursework and record grades and feedback.'}
          </p>
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="todo-class-filter" className="text-xs font-semibold text-slate-500 shrink-0">Class:</label>
          <select
            id="todo-class-filter"
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All classes ({userClasses.length})</option>
            {userClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Switcher (Google Classroom style) */}
      {isStudent ? (
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
          <button
            onClick={() => setStudentTab('assigned')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              studentTab === 'assigned'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Assigned ({assignedItems.length})
          </button>
          <button
            onClick={() => setStudentTab('missing')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              studentTab === 'missing'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Missing ({missingItems.length})
          </button>
          <button
            onClick={() => setStudentTab('done')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              studentTab === 'done'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Done ({doneItems.length})
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
          <button
            onClick={() => setTeacherTab('to-review')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              teacherTab === 'to-review'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            To review ({toReviewSubmissions.length})
          </button>
          <button
            onClick={() => setTeacherTab('reviewed')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              teacherTab === 'reviewed'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Reviewed ({reviewedSubmissions.length})
          </button>
        </div>
      )}

      {/* Content List */}
      <div className="space-y-3">
        {isStudent ? (
          <>
            {studentTab === 'assigned' && (
              assignedItems.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Woohoo, no work due!</p>
                  <p className="text-xs text-slate-400 mt-1">You are all caught up on your assignments.</p>
                </div>
              ) : (
                assignedItems.map(item => (
                  <div
                    key={item.assignment.id}
                    onClick={() => onSelectAssignment(item.assignment)}
                    className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {item.assignment.title}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.course.name}</span>
                          <span>&bull;</span>
                          <span>{item.assignment.points} points</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due {new Date(item.assignment.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                      <span className="text-[11px] text-indigo-600 font-semibold group-hover:underline inline-flex items-center gap-0.5 mt-1">
                        <span>View assignment</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )
            )}

            {studentTab === 'missing' && (
              missingItems.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">No missing work!</p>
                  <p className="text-xs text-slate-400 mt-1">You have submitted everything on schedule.</p>
                </div>
              ) : (
                missingItems.map(item => (
                  <div
                    key={item.assignment.id}
                    onClick={() => onSelectAssignment(item.assignment)}
                    className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-rose-200 dark:border-rose-900/50 hover:border-rose-300 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-rose-600">
                          {item.assignment.title}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.course.name}</span>
                          <span>&bull;</span>
                          <span className="text-rose-600 font-bold">Past Due</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-rose-600">
                        Was due {new Date(item.assignment.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                      <span className="text-[11px] text-rose-600 font-bold group-hover:underline inline-flex items-center gap-0.5 mt-1">
                        <span>Turn in late</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )
            )}

            {studentTab === 'done' && (
              doneItems.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Clock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">No completed assignments yet</p>
                  <p className="text-xs text-slate-400 mt-1">Assignments you have turned in will appear here.</p>
                </div>
              ) : (
                doneItems.map(item => {
                  const sub = item.submission;
                  return (
                    <div
                      key={item.assignment.id}
                      onClick={() => onSelectAssignment(item.assignment)}
                      className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600">
                            {item.assignment.title}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{item.course.name}</span>
                            <span>&bull;</span>
                            <span>Turned in</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {sub?.status === 'reviewed' ? (
                          <div className="text-xs font-black text-emerald-600">
                            {sub.grade} / {item.assignment.points} pts
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500">
                            Waiting for grade
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            )}
          </>
        ) : (
          /* Teacher / Admin view */
          <>
            {teacherTab === 'to-review' && (
              toReviewSubmissions.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">There are no pending student submissions waiting for review.</p>
                </div>
              ) : (
                toReviewSubmissions.map(sub => {
                  const a = db.getAssignmentById(sub.assignmentId);
                  if (!a) return null;
                  const c = db.getClassById(a.classId);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => onSelectAssignment(a)}
                      className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600">
                            {a.title}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.studentName}</span>
                            <span>&bull;</span>
                            <span>{c?.name || 'Course'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-bold">
                          Needs Grading
                        </span>
                      </div>
                    </div>
                  );
                })
              )
            )}

            {teacherTab === 'reviewed' && (
              reviewedSubmissions.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Clock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">No graded submissions yet</p>
                  <p className="text-xs text-slate-400 mt-1">Once you grade student submissions, they will appear here.</p>
                </div>
              ) : (
                reviewedSubmissions.map(sub => {
                  const a = db.getAssignmentById(sub.assignmentId);
                  if (!a) return null;
                  const c = db.getClassById(a.classId);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => onSelectAssignment(a)}
                      className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600">
                            {a.title}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.studentName}</span>
                            <span>&bull;</span>
                            <span>{c?.name || 'Course'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-600">
                          Graded: {sub.grade} / {a.points} pts
                        </span>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};
