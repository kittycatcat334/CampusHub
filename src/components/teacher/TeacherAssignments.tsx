import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Assignment, Submission, UniversityClass } from '../../types';
import {
  FileCheck2,
  Plus,
  Search,
  Calendar,
  Clock,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Edit3,
  Trash2,
  X,
  Sparkles,
  CalendarClock
} from 'lucide-react';

interface TeacherAssignmentsProps {
  onOpenCreateAssignment: () => void;
  onOpenScheduleProject?: () => void;
  onGradeSubmission: (submission: Submission, assignment: Assignment, course?: UniversityClass) => void;
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string | null) => void;
}

export const TeacherAssignments: React.FC<TeacherAssignmentsProps> = ({
  onOpenCreateAssignment,
  onOpenScheduleProject,
  onGradeSubmission,
  selectedCourseId,
  onSelectCourse
}) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const teacherClasses = db.getTeacherClasses(currentUser.id);
  const teacherClassIds = new Set(teacherClasses.map(c => c.id));
  const classMap = new Map(teacherClasses.map(c => [c.id, c]));

  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    db.getAssignments().filter(a => teacherClassIds.has(a.classId))
  );
  const [submissions, setSubmissions] = useState<Submission[]>(() => db.getSubmissions());

  const [selectedClassId, setSelectedClassId] = useState<string>(selectedCourseId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);

  // Edit Assignment Dates & Details Modal State
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    dueDate: '', // formatted for datetime-local
    points: 100,
    category: 'Homework' as Assignment['category']
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const refreshAssignments = () => {
    setAssignments(db.getAssignments().filter(a => teacherClassIds.has(a.classId)));
    setSubmissions(db.getSubmissions());
  };

  const filteredAssignments = assignments.filter(a => {
    if (selectedClassId !== 'all' && a.classId !== selectedClassId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const course = classMap.get(a.classId);
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchCourse = course ? course.code.toLowerCase().includes(q) : false;
      return matchTitle || matchCourse;
    }
    return true;
  });

  const handleOpenEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    // Convert ISO string to format required by <input type="datetime-local" />
    let formattedDue = assignment.dueDate;
    try {
      const d = new Date(assignment.dueDate);
      // Format YYYY-MM-DDTHH:mm
      const pad = (n: number) => n.toString().padStart(2, '0');
      formattedDue = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      // fallback
    }

    setEditForm({
      title: assignment.title,
      description: assignment.description,
      dueDate: formattedDue,
      points: assignment.points,
      category: assignment.category || 'Homework'
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    db.updateAssignment(editingAssignment.id, {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      dueDate: new Date(editForm.dueDate).toISOString(),
      points: Number(editForm.points),
      category: editForm.category
    });

    setEditingAssignment(null);
    refreshAssignments();
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    db.deleteAssignment(assignmentId);
    setDeleteConfirmId(null);
    setEditingAssignment(null);
    refreshAssignments();
  };

  // Quick Date Extension Helper
  const applyDateExtension = (daysToAdd: number) => {
    try {
      const base = editForm.dueDate ? new Date(editForm.dueDate) : new Date('2026-09-17T23:59:00');
      base.setDate(base.getDate() + daysToAdd);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const newStr = `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}T${pad(base.getHours())}:${pad(base.getMinutes())}`;
      setEditForm(prev => ({ ...prev, dueDate: newStr }));
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Course Assignments & Student Submissions
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              {assignments.length} Total Deliverables
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create deliverables, modify assignment deadlines, inspect student files, award points, and schedule projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {onOpenScheduleProject && (
            <button
              id="btn-teacher-assignments-schedule"
              onClick={onOpenScheduleProject}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Project / Work</span>
            </button>
          )}
          <button
            onClick={onOpenCreateAssignment}
            className="inline-flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assignments by title or course code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              if (onSelectCourse) onSelectCourse(e.target.value === 'all' ? null : e.target.value);
            }}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-medium"
          >
            <option value="all">All Instructed Courses ({teacherClasses.length})</option>
            {teacherClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.code} - {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No assignments found</h3>
          <p className="text-slate-400 text-xs mt-1">Create an assignment to start collecting student work.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const course = classMap.get(assignment.classId);
            const classSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
            const reviewedCount = classSubmissions.filter(s => s.status === 'reviewed').length;
            const pendingCount = classSubmissions.filter(s => s.status === 'submitted').length;
            const isExpanded = expandedAssignmentId === assignment.id;
            const urgency = db.getAssignmentRealTimeUrgency(assignment.dueDate);

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        {course?.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{course?.name}</span>
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {assignment.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${urgency.badgeColor}`}>
                        {urgency.text}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">{assignment.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{assignment.description}</p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right text-xs">
                      <p className="font-semibold text-slate-700 flex items-center sm:justify-end gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        Due {new Date(assignment.dueDate).toLocaleDateString()} at {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {assignment.points} Pts &bull; {classSubmissions.length} Turned in
                      </p>
                    </div>

                    {/* MODIFY ASSIGNMENT DATES BUTTON */}
                    <button
                      onClick={() => handleOpenEdit(assignment)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 text-purple-700 hover:border-purple-300 text-xs font-bold transition-all shadow-2xs"
                      title="Modify Assignment Dates & Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modify Dates</span>
                    </button>

                    <button
                      onClick={() => setExpandedAssignmentId(isExpanded ? null : assignment.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        isExpanded
                          ? 'bg-slate-100 text-slate-700'
                          : pendingCount > 0
                          ? 'bg-purple-700 text-white hover:bg-purple-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Submissions ({classSubmissions.length})</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Submissions Sub-table */}
                {isExpanded && (
                  <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Submitted Student Deliverables
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-emerald-700 font-bold">{reviewedCount} Graded</span>
                        <span>&bull;</span>
                        <span className="text-amber-700 font-bold">{pendingCount} Needs Review</span>
                      </div>
                    </div>

                    {classSubmissions.length === 0 ? (
                      <div className="p-6 text-center bg-white rounded-xl border border-slate-200">
                        <p className="text-xs text-slate-500">No student submissions turned in yet for this assignment.</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-bold">
                            <tr>
                              <th className="py-2.5 px-3">Student Name</th>
                              <th className="py-2.5 px-3">Date Submitted</th>
                              <th className="py-2.5 px-3">File / Link</th>
                              <th className="py-2.5 px-3">Status / Grade</th>
                              <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {classSubmissions.map((sub) => {
                              const isRev = sub.status === 'reviewed';
                              return (
                                <tr key={sub.id} className="hover:bg-slate-50/50">
                                  <td className="py-3 px-3 font-semibold text-slate-800">
                                    {sub.studentName}
                                  </td>
                                  <td className="py-3 px-3 text-slate-500">
                                    {new Date(sub.submittedAt).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 truncate max-w-[140px]">
                                    {sub.content}
                                  </td>
                                  <td className="py-3 px-3">
                                    {isRev ? (
                                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                                        Graded: {sub.grade}/{assignment.points}
                                      </span>
                                    ) : (
                                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                                        Awaiting Review
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <button
                                      onClick={() => onGradeSubmission(sub, assignment, course)}
                                      className="text-xs font-bold text-purple-700 hover:text-purple-900 px-2.5 py-1 rounded-lg border border-purple-200 hover:bg-purple-50"
                                    >
                                      {isRev ? 'Edit Grade' : 'Grade'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODIFY ASSIGNMENT DATES & DETAILS MODAL */}
      {editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Modify Assignment Dates & Info</h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Adjust deadline cutoffs, point weights, and description
                </p>
              </div>
              <button
                onClick={() => setEditingAssignment(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600 font-semibold"
                />
              </div>

              {/* DUE DATE & CUTOFF (KEY REQUIREMENT) */}
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4 text-purple-700" />
                    Due Date & Time Cutoff
                  </label>
                  <span className="text-[10px] text-purple-600 font-medium">Auto-updates student countdown</span>
                </div>
                <input
                  type="datetime-local"
                  required
                  value={editForm.dueDate}
                  onChange={e => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 font-semibold text-slate-800"
                />

                {/* Quick extension shortcuts */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1.5 font-semibold uppercase">
                    Quick Deadline Extension Shortcuts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyDateExtension(1)}
                      className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
                    >
                      +1 Day Extension
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDateExtension(3)}
                      className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
                    >
                      +3 Days Extension
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDateExtension(7)}
                      className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
                    >
                      +1 Week Extension
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Deliverable Category</label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600"
                  >
                    <option value="Homework">Homework</option>
                    <option value="Project">Project</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Lab">Lab</option>
                    <option value="Exam">Exam</option>
                    <option value="Essay">Essay</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Points Possible</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={editForm.points}
                    onChange={e => setEditForm(prev => ({ ...prev, points: Number(e.target.value) }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Instructions & Guidelines</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600"
                />
              </div>

              {/* Danger Zone: Delete Assignment */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {deleteConfirmId === editingAssignment.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-600 font-bold">Confirm delete assignment?</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(editingAssignment.id)}
                      className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
                    >
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(editingAssignment.id)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Deliverable</span>
                  </button>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs"
                >
                  Save Date & Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
