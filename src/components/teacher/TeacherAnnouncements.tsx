import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Announcement, UniversityClass } from '../../types';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Pin,
  AlertTriangle,
  Calendar,
  Mail,
  User,
  Paperclip,
  FileText,
  Download,
  Edit3,
  Trash2,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface TeacherAnnouncementsProps {
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string | null) => void;
}

export const TeacherAnnouncements: React.FC<TeacherAnnouncementsProps> = ({
  selectedCourseId,
  onSelectCourse
}) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const teacherClasses = isAdmin ? db.getClasses() : db.getTeacherClasses(currentUser.id);
  const teacherClassIds = new Set(teacherClasses.map(c => c.id));
  const classMap = new Map(db.getClasses().map(c => [c.id, c]));

  const getAnnouncementsForUser = () => {
    if (isAdmin) return db.getAnnouncements();
    return db.getAnnouncements().filter(a => teacherClassIds.has(a.classId));
  };

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => getAnnouncementsForUser());

  const [selectedClassId, setSelectedClassId] = useState<string>(selectedCourseId || 'all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'important' | 'normal'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Announcement Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    classId: teacherClasses[0]?.id || '',
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    pinned: false,
    attachmentName: '',
    attachmentUrl: ''
  });

  // Edit / Modify Announcement Modal State
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editForm, setEditForm] = useState({
    classId: '',
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    pinned: false,
    attachmentName: '',
    attachmentUrl: ''
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const refreshAnnouncements = () => {
    setAnnouncements(db.getAnnouncements().filter(a => teacherClassIds.has(a.classId)));
  };

  const filteredAnnouncements = announcements.filter(a => {
    if (selectedClassId !== 'all' && a.classId !== selectedClassId) return false;
    if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchContent = a.content.toLowerCase().includes(q);
      const matchCode = a.classCode?.toLowerCase().includes(q);
      return matchTitle || matchContent || matchCode;
    }
    return true;
  });

  // Create Announcement Handler
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.classId || !createForm.title.trim() || !createForm.content.trim()) return;

    const targetClass = classMap.get(createForm.classId);
    const attachments = createForm.attachmentName.trim()
      ? [
          {
            name: createForm.attachmentName.trim(),
            url: createForm.attachmentUrl.trim() || '#',
            size: '250 KB'
          }
        ]
      : [];

    db.createAnnouncement({
      classId: createForm.classId,
      className: targetClass ? targetClass.name : 'University Course',
      classCode: targetClass ? targetClass.code : 'UNIV',
      teacherId: currentUser.id,
      title: createForm.title.trim(),
      content: createForm.content.trim(),
      priority: createForm.priority,
      pinned: createForm.pinned,
      authorName: currentUser.name,
      authorRole: currentUser.title || 'Faculty Instructor',
      authorEmail: currentUser.email,
      attachments
    });

    setIsCreateOpen(false);
    setCreateForm({
      classId: teacherClasses[0]?.id || '',
      title: '',
      content: '',
      priority: 'normal',
      pinned: false,
      attachmentName: '',
      attachmentUrl: ''
    });
    refreshAnnouncements();
  };

  // Open Edit Announcement Modal
  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setEditForm({
      classId: ann.classId,
      title: ann.title,
      content: ann.content,
      priority: ann.priority,
      pinned: ann.pinned || false,
      attachmentName: ann.attachments && ann.attachments[0] ? ann.attachments[0].name : '',
      attachmentUrl: ann.attachments && ann.attachments[0] ? ann.attachments[0].url : ''
    });
  };

  // Save Modified Announcement
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;

    const targetClass = classMap.get(editForm.classId);
    const attachments = editForm.attachmentName.trim()
      ? [
          {
            name: editForm.attachmentName.trim(),
            url: editForm.attachmentUrl.trim() || '#',
            size: '250 KB'
          }
        ]
      : [];

    db.updateAnnouncement(editingAnnouncement.id, {
      classId: editForm.classId,
      className: targetClass ? targetClass.name : editingAnnouncement.className,
      classCode: targetClass ? targetClass.code : editingAnnouncement.classCode,
      title: editForm.title.trim(),
      content: editForm.content.trim(),
      priority: editForm.priority,
      pinned: editForm.pinned,
      attachments
    });

    setEditingAnnouncement(null);
    refreshAnnouncements();
  };

  // Delete Announcement Handler
  const handleDeleteAnnouncement = (announcementId: string) => {
    db.deleteAnnouncement(announcementId);
    setDeleteConfirmId(null);
    setEditingAnnouncement(null);
    refreshAnnouncements();
  };

  // Quick Pin Toggle
  const handleTogglePin = (ann: Announcement) => {
    db.updateAnnouncement(ann.id, { pinned: !ann.pinned });
    refreshAnnouncements();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Faculty Announcements & Broadcasts
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              {announcements.length} Published
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish official announcements, modify existing notices, attach handouts, and delete obsolete updates.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search announcements by title, content, or course code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                if (onSelectCourse) onSelectCourse(e.target.value === 'all' ? null : e.target.value);
              }}
              className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-hidden focus:border-purple-600"
            >
              <option value="all">All Courses ({teacherClasses.length})</option>
              {teacherClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.code} - {cls.name}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-hidden focus:border-purple-600"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="important">Important</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements Stream */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No announcements found</h3>
          <p className="text-slate-400 text-xs mt-1">
            Broadcast your first announcement or exam notice to your students.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Post Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => {
            const dateObj = new Date(ann.createdAt);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            });
            const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={ann.id}
                className={`p-6 rounded-2xl border bg-white shadow-xs transition-all ${
                  ann.pinned
                    ? 'border-purple-300 ring-2 ring-purple-500/10'
                    : ann.priority === 'urgent'
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Bar: Course, Priority, Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                      {ann.classCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{ann.className}</span>

                    {ann.pinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        <Pin className="w-3 h-3 text-amber-700" /> Pinned to Top
                      </span>
                    )}

                    {ann.priority === 'urgent' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Urgent Alert
                      </span>
                    )}

                    {ann.priority === 'important' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                        Important
                      </span>
                    )}
                  </div>

                  {/* TEACHER MANAGEMENT ACTIONS: PIN, MODIFY, DELETE */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePin(ann)}
                      className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        ann.pinned
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title={ann.pinned ? 'Unpin Announcement' : 'Pin to Top of Student Feed'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(ann)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-purple-50 text-purple-700 hover:border-purple-300 text-xs font-bold transition-all shadow-2xs"
                      title="Modify Announcement"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modify</span>
                    </button>

                    {deleteConfirmId === ann.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="px-2 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(ann.id)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-rose-600 hover:border-rose-300 transition-colors"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Announcement Content */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2">
                  {ann.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                  {ann.content}
                </p>

                {/* Attachments if any */}
                {ann.attachments && ann.attachments.length > 0 && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                      <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                      Attached Handout ({ann.attachments.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ann.attachments.map((file, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-600" />
                          <span>{file.name}</span>
                          {file.size && <span className="text-[10px] text-slate-400">({file.size})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer with Instructor Name & Exact Date */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-semibold text-slate-700">{ann.authorName}</span>
                    <span>&bull;</span>
                    <span className="text-slate-400">{ann.authorRole || 'Instructor'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Posted {formattedDate} at {formattedTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ANNOUNCEMENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Post New Announcement</h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Broadcast updates, exam alerts, and lecture changes to student feeds
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Course</label>
                <select
                  required
                  value={createForm.classId}
                  onChange={e => setCreateForm(prev => ({ ...prev, classId: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600 font-semibold"
                >
                  {teacherClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.code} - {cls.name} ({cls.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={e => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Midterm Review Session Schedule & Practice Exam"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notice Message / Details</label>
                <textarea
                  rows={4}
                  required
                  value={createForm.content}
                  onChange={e => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Provide full instructions, review room details, or schedule shifts..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Priority Level</label>
                  <select
                    value={createForm.priority}
                    onChange={e => setCreateForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important Notice</option>
                    <option value="urgent">Urgent Alert (Red Banner)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={createForm.pinned}
                      onChange={e => setCreateForm(prev => ({ ...prev, pinned: e.target.checked }))}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Pin to top of feed</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                  Optional Handout Attachment
                </label>
                <input
                  type="text"
                  value={createForm.attachmentName}
                  onChange={e => setCreateForm(prev => ({ ...prev, attachmentName: e.target.value }))}
                  placeholder="e.g. Midterm1_Practice_Exam.pdf"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs"
                >
                  Broadcast Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODIFY ANNOUNCEMENT MODAL */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Modify Announcement</h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Update announcement text, priority, pin status, or attachment
                </p>
              </div>
              <button
                onClick={() => setEditingAnnouncement(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Course</label>
                <select
                  required
                  value={editForm.classId}
                  onChange={e => setEditForm(prev => ({ ...prev, classId: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600 font-semibold"
                >
                  {teacherClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.code} - {cls.name} ({cls.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notice Message / Details</label>
                <textarea
                  rows={4}
                  required
                  value={editForm.content}
                  onChange={e => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Priority Level</label>
                  <select
                    value={editForm.priority}
                    onChange={e => setEditForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important Notice</option>
                    <option value="urgent">Urgent Alert (Red Banner)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editForm.pinned}
                      onChange={e => setEditForm(prev => ({ ...prev, pinned: e.target.checked }))}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Pin to top of feed</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                  Attachment Handout Name
                </label>
                <input
                  type="text"
                  value={editForm.attachmentName}
                  onChange={e => setEditForm(prev => ({ ...prev, attachmentName: e.target.value }))}
                  placeholder="e.g. Review_Slides.pdf"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              {/* Danger Zone: Delete Announcement */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {deleteConfirmId === editingAnnouncement.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-600 font-bold">Confirm delete announcement?</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(editingAnnouncement.id)}
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
                    onClick={() => setDeleteConfirmId(editingAnnouncement.id)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Announcement</span>
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
