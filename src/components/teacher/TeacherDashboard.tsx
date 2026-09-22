import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Submission, Assignment, UniversityClass } from '../../types';
import {
  BookOpen,
  FileCheck2,
  Megaphone,
  FolderArchive,
  Plus,
  Users,
  Clock,
  CheckCircle2,
  Award,
  ArrowRight,
  Sparkles,
  Paperclip,
  ExternalLink,
  ChevronRight,
  Filter,
  Calendar,
  X,
  ShieldCheck
} from 'lucide-react';

interface TeacherDashboardProps {
  onOpenCreateClass: () => void;
  onOpenCreateAssignment: (classId?: string) => void;
  onOpenScheduleProject?: () => void;
  onOpenPostAnnouncement: (classId?: string) => void;
  onOpenUploadResource: (classId?: string) => void;
  onGradeSubmission: (submission: Submission, assignment: Assignment, course?: UniversityClass) => void;
  onNavigate: (tab: string) => void;
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string | null) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onOpenCreateClass,
  onOpenCreateAssignment,
  onOpenScheduleProject,
  onOpenPostAnnouncement,
  onOpenUploadResource,
  onGradeSubmission,
  onNavigate,
  selectedCourseId,
  onSelectCourse
}) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const rawTeacherClasses = db.getTeacherClasses(currentUser.id);
  const teacherClasses = selectedCourseId
    ? rawTeacherClasses.filter(c => c.id === selectedCourseId)
    : rawTeacherClasses;
  const selectedCourse = selectedCourseId ? rawTeacherClasses.find(c => c.id === selectedCourseId) : null;

  const teacherClassIds = new Set(teacherClasses.map(c => c.id));
  const classMap = new Map(rawTeacherClasses.map(c => [c.id, c]));

  const teacherAssignments = db.getAssignments().filter(a => teacherClassIds.has(a.classId));
  const assignmentMap = new Map(teacherAssignments.map(a => [a.id, a]));

  const allSubmissions = db.getSubmissions().filter(s => {
    const a = assignmentMap.get(s.assignmentId);
    return a && teacherClassIds.has(a.classId);
  });

  const pendingSubmissions = allSubmissions.filter(s => s.status === 'submitted');
  const reviewedSubmissions = allSubmissions.filter(s => s.status === 'reviewed');

  const totalStudents = teacherClasses.reduce((acc, c) => acc + (c.enrolledStudentCount || 25), 0);

  return (
    <div className="space-y-6">
      {/* Course Focus Filter Banner */}
      {selectedCourse && (
        <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-purple-950 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold">
                Filtered Course: <span className="font-extrabold">{selectedCourse.code}</span> &bull; {selectedCourse.name} ({selectedCourse.section})
              </p>
              <p className="text-[11px] text-purple-700">
                Viewing deliverables, submissions, and rosters for this specific section.
              </p>
            </div>
          </div>
          {onSelectCourse && (
            <button
              onClick={() => onSelectCourse(null)}
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 bg-white px-2.5 py-1.5 rounded-lg border border-purple-200 shadow-xs hover:bg-purple-50 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Show All Courses</span>
            </button>
          )}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                Instructor Hub &bull; {currentUser.department || 'Faculty'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                SV-Code Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Space_Grotesk']">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-sm text-purple-200 mt-1 max-w-2xl">
              You have {pendingSubmissions.length} student {pendingSubmissions.length === 1 ? 'submission' : 'submissions'} waiting for review across {teacherClasses.length} active courses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenScheduleProject && (
              <button
                id="btn-teacher-dashboard-schedule"
                onClick={onOpenScheduleProject}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-300 hover:to-indigo-300 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Calendar className="w-4 h-4 text-purple-950" />
                <span>Schedule Project & Assignment</span>
              </button>
            )}
            <button
              onClick={() => onOpenCreateAssignment()}
              className="inline-flex items-center gap-1.5 bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-purple-700" />
              <span>Create Assignment</span>
            </button>
            <button
              onClick={onOpenCreateClass}
              className="inline-flex items-center gap-1.5 bg-purple-700/60 hover:bg-purple-700 text-white font-semibold text-xs px-3 py-2.5 rounded-xl border border-purple-400/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Course</span>
            </button>
          </div>
        </div>

        {/* Top metrics bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-purple-700/50">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-200">Active Courses</p>
            <p className="text-2xl font-black text-white mt-0.5">{teacherClasses.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-200">Total Enrolled</p>
            <p className="text-2xl font-black text-white mt-0.5">{totalStudents}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Pending Grading</p>
            <p className="text-2xl font-black text-amber-300 mt-0.5">{pendingSubmissions.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Graded Work</p>
            <p className="text-2xl font-black text-emerald-300 mt-0.5">{reviewedSubmissions.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {onOpenScheduleProject && (
          <button
            onClick={onOpenScheduleProject}
            className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 hover:border-purple-400 hover:shadow-sm text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-700 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="font-bold text-xs text-purple-950">Schedule Project</p>
            <p className="text-[11px] text-purple-700 mt-0.5">Plan future releases</p>
          </button>
        )}

        <button
          onClick={() => onOpenCreateAssignment()}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-sm text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <p className="font-bold text-xs text-slate-800">Add Assignment</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Post problem set or task</p>
        </button>

        <button
          onClick={() => onOpenPostAnnouncement()}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-sm text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Megaphone className="w-5 h-5" />
          </div>
          <p className="font-bold text-xs text-slate-800">Post Announcement</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Broadcast class updates</p>
        </button>

        <button
          onClick={() => onOpenUploadResource()}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-sm text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <FolderArchive className="w-5 h-5" />
          </div>
          <p className="font-bold text-xs text-slate-800">Upload Resources</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Lecture slides & readings</p>
        </button>

        <button
          onClick={onOpenCreateClass}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-sm text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="font-bold text-xs text-slate-800">New Course</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Generate course join code</p>
        </button>
      </div>

      {/* Teacher Quick Management Bar */}
      <div className="bg-gradient-to-r from-purple-50 via-white to-indigo-50 p-4 rounded-2xl border border-purple-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
          <div>
            <span className="text-xs font-bold text-purple-950 block sm:inline">Faculty Management Shortcuts:</span>{' '}
            <span className="text-xs text-slate-500">Quickly adjust due dates, modify class timetable schedules, and manage announcements.</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('classes')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-800 hover:bg-purple-100 font-bold text-xs shadow-2xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Modify Schedules</span>
          </button>
          <button
            onClick={() => onNavigate('assignments')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-800 hover:bg-purple-100 font-bold text-xs shadow-2xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span>Modify Assignment Dates</span>
          </button>
          <button
            onClick={() => onNavigate('announcements')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-800 hover:bg-purple-100 font-bold text-xs shadow-2xs transition-colors"
          >
            <Megaphone className="w-3.5 h-3.5 text-purple-600" />
            <span>Manage Announcements</span>
          </button>
        </div>
      </div>

      {/* Submissions Review Queue (Core Grading Action) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-700" />
            <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
              Student Submissions Review Queue
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            {pendingSubmissions.length} Waiting for Review
          </span>
        </div>

        {allSubmissions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
            <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No submissions received yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Student submissions will show up here for you to grade and provide feedback.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Student</th>
                  <th className="pb-3">Course & Assignment</th>
                  <th className="pb-3">Submitted At</th>
                  <th className="pb-3">File / Work</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allSubmissions.map((sub) => {
                  const assignment = assignmentMap.get(sub.assignmentId);
                  const course = assignment ? classMap.get(assignment.classId) : undefined;
                  const isReviewed = sub.status === 'reviewed';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                            {sub.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{sub.studentName}</p>
                            <p className="text-[10px] text-slate-400">{sub.studentEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded mr-1">
                          {course?.code}
                        </span>
                        <span className="font-semibold text-slate-800">{assignment?.title}</span>
                      </td>

                      <td className="py-3.5 text-slate-500">
                        {new Date(sub.submittedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td className="py-3.5">
                        <span className="font-mono text-[11px] text-slate-700 truncate max-w-[150px] inline-block">
                          {sub.content}
                        </span>
                      </td>

                      <td className="py-3.5">
                        {isReviewed ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> {sub.grade}/{assignment?.points}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[11px] border border-amber-200 animate-pulse">
                            <Clock className="w-3 h-3" /> Ready to Grade
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 text-right pr-2">
                        <button
                          onClick={() => assignment && onGradeSubmission(sub, assignment, course)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                            isReviewed
                              ? 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                              : 'bg-purple-700 hover:bg-purple-800 text-white shadow-xs'
                          }`}
                        >
                          {isReviewed ? 'Edit Grade' : 'Grade Work'}
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

      {/* Courses Managed Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-700" />
            <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
              Courses You Instruct
            </h2>
          </div>
          <button
            onClick={() => onNavigate('classes')}
            className="text-xs font-bold text-purple-700 hover:text-purple-900"
          >
            Manage All Courses &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teacherClasses.map((cls) => {
            const classTasks = teacherAssignments.filter(a => a.classId === cls.id);

            return (
              <div
                key={cls.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-all bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    {cls.code}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <span>Join:</span>
                    <span className="text-purple-700">{cls.joinCode}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{cls.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{cls.schedule}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>{cls.enrolledStudentCount || 25} Students</span>
                  <span>{classTasks.length} Assignments</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
