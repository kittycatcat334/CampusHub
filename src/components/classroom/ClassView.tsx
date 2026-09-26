import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { UniversityClass, Assignment, Announcement, ClassResource, Submission } from '../../types';
import {
  Megaphone,
  FileCheck2,
  Users,
  Award,
  Plus,
  Calendar,
  Clock,
  Pin,
  Paperclip,
  Send,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Edit3,
  Trash2,
  FolderArchive,
  Download,
  Mail,
  UserCheck
} from 'lucide-react';

interface ClassViewProps {
  course: UniversityClass;
  activeTab: 'stream' | 'classwork' | 'people' | 'grades';
  onChangeTab: (tab: 'stream' | 'classwork' | 'people' | 'grades') => void;
  onOpenCreateAssignment: (classId: string) => void;
  onOpenUploadResource: (classId: string) => void;
  onSelectAssignment: (assignment: Assignment) => void;
  onGradeSubmission: (submission: Submission, assignment: Assignment, course: UniversityClass) => void;
}

export const ClassView: React.FC<ClassViewProps> = ({
  course,
  activeTab,
  onChangeTab,
  onOpenCreateAssignment,
  onOpenUploadResource,
  onSelectAssignment,
  onGradeSubmission
}) => {
  const { currentUser, isTeacher, isStudent, isAdmin } = useAuth();
  if (!currentUser) return null;

  const [copiedCode, setCopiedCode] = useState(false);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);

  // Stream announcement composer state
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementPinned, setAnnouncementPinned] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Live course data
  const assignments = db.getAssignments(course.id);
  const announcements = db.getAnnouncements(course.id);
  const resources = db.getResources(course.id);
  const submissions = db.getSubmissions();

  // Enrolled students
  const enrollments = db.getUsers().filter(u => {
    if (u.role !== 'student') return false;
    const enrolled = db.getStudentClasses(u.id);
    return enrolled.some(c => c.id === course.id);
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(course.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementContent.trim()) return;

    setIsPosting(true);
    db.createAnnouncement({
      classId: course.id,
      className: course.name,
      classCode: course.code,
      teacherId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.title || (isTeacher ? 'Faculty Instructor' : 'Student'),
      authorEmail: currentUser.email,
      title: announcementTitle.trim() || 'Class Announcement',
      content: announcementContent.trim(),
      priority: 'normal',
      pinned: announcementPinned
    });

    setAnnouncementTitle('');
    setAnnouncementContent('');
    setAnnouncementPinned(false);
    setIsAnnouncing(false);
    setIsPosting(false);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Delete this announcement?')) {
      db.deleteAnnouncement(id);
    }
  };

  const handleDeleteAssignment = (id: string, title: string) => {
    if (confirm(`Delete assignment "${title}"?`)) {
      db.deleteAssignment(id);
    }
  };

  const handleDeleteResource = (id: string) => {
    if (confirm('Delete this learning resource?')) {
      db.deleteResource(id);
    }
  };

  // Group classwork by topic/category
  const homeworkItems = assignments.filter(a => a.category === 'Homework' || !a.category);
  const labItems = assignments.filter(a => a.category === 'Lab');
  const projectItems = assignments.filter(a => a.category === 'Project');

  return (
    <div className="space-y-6">
      {/* Course Banner (Google Classroom style cover) */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-white/20 text-white backdrop-blur-xs">
                {course.code}
              </span>
              <span className="text-xs font-medium text-white/80">
                {course.section} &bull; {course.semester}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-['Space_Grotesk']">
              {course.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl">
              {course.description || `Lecture Location: ${course.room} &bull; Meeting Schedule: ${course.schedule}`}
            </p>
            <p className="text-xs text-white/80 font-medium pt-1">
              Instructor: {course.teacherName} ({course.teacherEmail})
            </p>
          </div>

          {/* Course Code Widget */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center justify-between gap-3 self-start md:self-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Class Code</p>
              <p className="font-mono text-base font-black tracking-wider text-white">{course.joinCode}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Copy class code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STREAM (Announcements feed + Upcoming sidebar) */}
      {/* ========================================================================= */}
      {activeTab === 'stream' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Upcoming Work Box */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Upcoming
                </h3>
                <button
                  onClick={() => onChangeTab('classwork')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View all
                </button>
              </div>

              {assignments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No work due soon</p>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 3).map((a) => {
                    const sub = isStudent ? db.getSubmissionForStudent(a.id, currentUser.id) : null;
                    return (
                      <div
                        key={a.id}
                        onClick={() => onSelectAssignment(a)}
                        className="text-xs space-y-0.5 cursor-pointer group"
                      >
                        <p className="text-[11px] text-slate-400 font-medium">
                          Due {new Date(a.dueDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {a.title}
                        </p>
                        {sub && (
                          <span className="text-[10px] text-emerald-600 font-bold inline-block">
                            Turned in
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Room details card */}
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs text-xs space-y-2">
              <p className="font-bold text-slate-700 dark:text-slate-300">Meeting Info</p>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>{course.schedule}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Location: {course.room}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Stream */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            {/* "Announce something to your class" interactive composer */}
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              {!isAnnouncing ? (
                <div
                  onClick={() => setIsAnnouncing(true)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 group-hover:bg-slate-200/70 transition-colors">
                    Announce something to your class...
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePostAnnouncement} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Post to {course.name}
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Announcement Title (e.g. Midterm Review Session or Office Hours)"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                  />

                  <textarea
                    rows={3}
                    required
                    placeholder="Share updates, lecture notes, or classroom instructions with students..."
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white leading-relaxed"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={announcementPinned}
                        onChange={(e) => setAnnouncementPinned(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Pin to top of class stream</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAnnouncing(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isPosting}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Announcements Stream */}
            {announcements.length === 0 ? (
              <div className="bg-white dark:bg-slate-850 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  This is where you can talk to your class
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Use the stream to share announcements, post course updates, and respond to student questions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {ann.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {ann.authorName}
                            </span>
                            {ann.pinned && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                                <Pin className="w-3 h-3" /> Pinned
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {(isTeacher || isAdmin || ann.authorEmail === currentUser.email) && (
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {ann.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLASSWORK (Assignments & Learning Materials organized by Topic) */}
      {/* ========================================================================= */}
      {activeTab === 'classwork' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Curriculum & Deliverables
              </h2>
              <p className="text-xs text-slate-500">
                {assignments.length} assignments &bull; {resources.length} learning resources
              </p>
            </div>

            {(isTeacher || isAdmin) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenUploadResource(course.id)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4 text-purple-600" />
                  <span>Add Material</span>
                </button>

                <button
                  onClick={() => onOpenCreateAssignment(course.id)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Assignment</span>
                </button>
              </div>
            )}
          </div>

          {/* Assignments List grouped cleanly */}
          {assignments.length === 0 && resources.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                This is where you will find course work
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Teachers can assign homework, labs, problem sets, and upload lecture syllabus files.
              </p>
              {(isTeacher || isAdmin) && (
                <button
                  onClick={() => onOpenCreateAssignment(course.id)}
                  className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                >
                  Create First Assignment
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* ASSIGNMENTS SECTION */}
              <div className="space-y-3">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Course Assignments ({assignments.length})
                </h3>

                <div className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                  {assignments.map((assignment) => {
                    const isExpanded = expandedAssignmentId === assignment.id;
                    const classSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
                    const studentSub = isStudent ? db.getSubmissionForStudent(assignment.id, currentUser.id) : null;

                    return (
                      <div key={assignment.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        {/* Assignment Row */}
                        <div
                          onClick={() => setExpandedAssignmentId(isExpanded ? null : assignment.id)}
                          className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center shrink-0">
                              <FileCheck2 className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                {assignment.title}
                              </h4>
                              <p className="text-[11px] text-slate-400">
                                Posted {new Date(assignment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 text-xs">
                            <span className="text-slate-500 font-medium hidden sm:inline-block">
                              Due {new Date(assignment.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>

                            {isStudent ? (
                              studentSub ? (
                                <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                                  {studentSub.status === 'reviewed' ? `${studentSub.grade}/${assignment.points} pts` : 'Turned in'}
                                </span>
                              ) : (
                                <span className="font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg">
                                  Assigned
                                </span>
                              )
                            ) : (
                              <span className="font-bold text-slate-600 dark:text-slate-300">
                                {classSubmissions.length} Turned in
                              </span>
                            )}

                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        {/* Expandable Accordion Body */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs bg-slate-50/50 dark:bg-slate-900/40">
                            <div className="flex items-center justify-between text-slate-500">
                              <span>Points: <strong>{assignment.points}</strong></span>
                              <span>Due: <strong>{new Date(assignment.dueDate).toLocaleString()}</strong></span>
                            </div>

                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                              {assignment.description}
                            </p>

                            {/* Attachments */}
                            {assignment.attachments && assignment.attachments.length > 0 && (
                              <div className="space-y-1.5 pt-2">
                                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500">Materials</p>
                                <div className="flex flex-wrap gap-2">
                                  {assignment.attachments.map((att, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                      <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                                      <span className="font-medium text-slate-700 dark:text-slate-200">{att.name}</span>
                                      <span className="text-[10px] text-slate-400">({att.size})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Actions Footer */}
                            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                              {(isTeacher || isAdmin) ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                                    className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => onSelectAssignment(assignment)}
                                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                  >
                                    Review Submissions ({classSubmissions.length})
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => onSelectAssignment(assignment)}
                                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                                >
                                  {studentSub ? 'View Submission / Resubmit' : 'Turn In Work'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COURSE MATERIALS & RESOURCES SECTION */}
              {resources.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Course Materials & Readings ({resources.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center shrink-0">
                              <FolderArchive className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                                {res.title}
                              </h4>
                              <span className="text-[10px] text-slate-400">{res.category} &bull; {res.fileSize || 'PDF'}</span>
                            </div>
                          </div>

                          {(isTeacher || isAdmin) && (
                            <button
                              onClick={() => handleDeleteResource(res.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600"
                              title="Delete file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {res.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2">{res.description}</p>
                        )}

                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Access Material</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PEOPLE (Teachers & Classmates Roster) */}
      {/* ========================================================================= */}
      {activeTab === 'people' && (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Teachers Section */}
          <div className="space-y-4">
            <div className="pb-3 border-b-2 border-indigo-600 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Teachers
              </h2>
              <span className="text-xs text-slate-400">1 Instructor</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {course.teacherName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {course.teacherName}
                  </h4>
                  <p className="text-xs text-slate-500">{course.teacherEmail}</p>
                </div>
              </div>

              <a
                href={`mailto:${course.teacherEmail}`}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                title="Send email to instructor"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Classmates Section */}
          <div className="space-y-4">
            <div className="pb-3 border-b-2 border-indigo-600 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Classmates
              </h2>
              <span className="text-xs text-slate-500 font-bold">{enrollments.length} Students</span>
            </div>

            {enrollments.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">No students currently enrolled.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {enrollments.map((student) => (
                  <div key={student.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-white">{student.name}</p>
                        <p className="text-[11px] text-slate-400">{student.email}</p>
                      </div>
                    </div>

                    {student.studentId && (
                      <span className="font-mono text-[11px] text-slate-400">{student.studentId}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GRADES (Gradebook for teachers / Report for students) */}
      {/* ========================================================================= */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
              {isTeacher || isAdmin ? 'Gradebook & Student Submissions' : 'My Grades & Academic Feedback'}
            </h2>
            <p className="text-xs text-slate-500">
              {isTeacher || isAdmin ? 'Review turned-in work, enter points, and return feedback.' : 'Your submitted deliverables and instructor grading.'}
            </p>
          </div>

          {assignments.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No graded assignments created yet.</p>
            </div>
          ) : isStudent ? (
            /* Student's personal grade report */
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <tr>
                    <th className="py-3 px-4">Assignment</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Teacher Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {assignments.map((a) => {
                    const sub = db.getSubmissionForStudent(a.id, currentUser.id);
                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {a.title}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(a.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-4">
                          {sub ? (
                            sub.status === 'reviewed' ? (
                              <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                                Graded
                              </span>
                            ) : (
                              <span className="font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                                Turned in
                              </span>
                            )
                          ) : (
                            <span className="font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                              Missing / Not submitted
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {sub?.grade !== undefined ? `${sub.grade} / ${a.points}` : `— / ${a.points}`}
                        </td>
                        <td className="py-3 px-4 text-slate-500 italic">
                          {sub?.feedback || 'No feedback yet'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Teacher / Admin Gradebook */
            <div className="space-y-4">
              {assignments.map((a) => {
                const subs = submissions.filter(s => s.assignmentId === a.id);
                return (
                  <div key={a.id} className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{a.title}</h4>
                        <p className="text-[11px] text-slate-400">Total Points: {a.points} &bull; {subs.length} Turned In</p>
                      </div>
                      <button
                        onClick={() => onSelectAssignment(a)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                      >
                        Open Grading Workspace
                      </button>
                    </div>

                    {subs.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No submissions turned in yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {subs.map((s) => (
                          <div key={s.id} className="py-2.5 flex items-center justify-between gap-3">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{s.studentName}</span>
                              <span className="text-[11px] text-slate-400 block">{s.content}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                {s.grade !== undefined ? `${s.grade} / ${a.points}` : 'Ungraded'}
                              </span>
                              <button
                                onClick={() => onGradeSubmission(s, a, course)}
                                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold"
                              >
                                {s.status === 'reviewed' ? 'Edit Grade' : 'Grade'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
