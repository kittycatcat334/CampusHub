import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Announcement } from '../../types';
import {
  Megaphone,
  Pin,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Mail,
  FileText,
  Download,
  Paperclip,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface StudentAnnouncementsProps {
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string | null) => void;
}

export const StudentAnnouncements: React.FC<StudentAnnouncementsProps> = ({
  selectedCourseId,
  onSelectCourse
}) => {
  const { currentUser } = useAuth();
  const enrolledClasses = db.getStudentClasses(currentUser.id);
  const enrolledClassIds = new Set(enrolledClasses.map(c => c.id));
  const announcements = db.getAnnouncements().filter(a => enrolledClassIds.has(a.classId));

  const [selectedClassId, setSelectedClassId] = useState<string>(selectedCourseId || 'all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'important'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (selectedCourseId) {
      setSelectedClassId(selectedCourseId);
    }
  }, [selectedCourseId]);

  const filtered = announcements.filter(a => {
    if (selectedClassId !== 'all' && a.classId !== selectedClassId) return false;
    if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchContent = a.content.toLowerCase().includes(q);
      const matchTeacher = a.authorName ? a.authorName.toLowerCase().includes(q) : false;
      const matchCode = a.classCode ? a.classCode.toLowerCase().includes(q) : false;
      return matchTitle || matchContent || matchTeacher || matchCode;
    }
    return true;
  });

  const urgentCount = announcements.filter(a => a.priority === 'urgent').length;
  const importantCount = announcements.filter(a => a.priority === 'important').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Space_Grotesk']">
              Class Announcements & Broadcasts
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              <Megaphone className="w-3.5 h-3.5" />
              Verified Faculty Updates
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official announcements with instructor names, verified dates, classroom alerts, and review sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            {filtered.length} {filtered.length === 1 ? 'Notice' : 'Notices'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search announcements by topic, instructor name, or course..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Course Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedClassId}
              onChange={e => {
                const val = e.target.value;
                setSelectedClassId(val);
                if (onSelectCourse) onSelectCourse(val === 'all' ? null : val);
              }}
              className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Enrolled Courses</option>
              {enrolledClasses.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.code} - {cls.name}
                </option>
              ))}
            </select>

            {/* Priority Selector */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Notices Only ({urgentCount})</option>
              <option value="important">Important ({importantCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements Stream */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No announcements to display</h3>
          <p className="text-slate-400 text-xs mt-1">
            Check back later for updates from your course instructors.
          </p>
          <button
            onClick={() => {
              setSelectedClassId('all');
              setPriorityFilter('all');
              setSearchQuery('');
              if (onSelectCourse) onSelectCourse(null);
            }}
            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(ann => {
            const dateObj = new Date(ann.createdAt);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const formattedTime = dateObj.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });

            // Relative date string
            const isToday = dateObj.getDate() === 17 && dateObj.getMonth() === 8 && dateObj.getFullYear() === 2026;
            const isYesterday = dateObj.getDate() === 16 && dateObj.getMonth() === 8 && dateObj.getFullYear() === 2026;
            const relativeDateBadge = isToday ? 'Today' : isYesterday ? 'Yesterday' : `${Math.max(1, 17 - dateObj.getDate())} days ago`;

            return (
              <div
                key={ann.id}
                className={`p-6 rounded-2xl border bg-white shadow-xs transition-all ${
                  ann.pinned
                    ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                    : ann.priority === 'urgent'
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Notice Top Bar: Course, Priority, and Relative Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {ann.classCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{ann.className}</span>

                    {ann.pinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        <Pin className="w-3 h-3 text-amber-700" /> Pinned
                      </span>
                    )}

                    {ann.priority === 'urgent' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Urgent Action Required
                      </span>
                    )}

                    {ann.priority === 'important' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                        Important
                      </span>
                    )}
                  </div>

                  {/* Relative date badge */}
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {relativeDateBadge}
                  </span>
                </div>

                {/* Announcement Title */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2">
                  {ann.title}
                </h3>

                {/* Notice Body */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                  {ann.content}
                </p>

                {/* Attachments if any */}
                {ann.attachments && ann.attachments.length > 0 && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                      <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                      Attached Handouts & Files ({ann.attachments.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ann.attachments.map((file, i) => (
                        <a
                          key={i}
                          href={file.url}
                          download
                          onClick={e => {
                            if (file.url === '#') e.preventDefault();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{file.name}</span>
                          {file.size && <span className="text-[10px] text-slate-400">({file.size})</span>}
                          <Download className="w-3 h-3 text-slate-400 ml-1" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* TEACHER NAME & DATE BOTTOM FOOTER */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {/* Instructor Identity */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {ann.authorName
                        ? ann.authorName.split(' ').map(n => n[0]).slice(0, 2).join('')
                        : 'FAC'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {ann.authorName}
                        </span>
                        {ann.authorEmail && (
                          <a
                            href={`mailto:${ann.authorEmail}`}
                            className="text-slate-400 hover:text-indigo-600 inline-flex items-center gap-0.5"
                            title={`Email ${ann.authorName}`}
                          >
                            <Mail className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {ann.authorRole || 'Faculty Instructor'}
                      </span>
                    </div>
                  </div>

                  {/* Exact Date & Time */}
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium self-start sm:self-center">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Posted on {formattedDate} at {formattedTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
