import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AnnouncementPriority } from '../../types';
import { X, Megaphone, CheckCircle2 } from 'lucide-react';

interface PostAnnouncementModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialClassId?: string;
}

export const PostAnnouncementModal: React.FC<PostAnnouncementModalProps> = ({
  onClose,
  onSuccess,
  initialClassId
}) => {
  const { currentUser } = useAuth();
  const classes = db.getTeacherClasses(currentUser.id);

  const [classId, setClassId] = useState<string>(initialClassId || (classes[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [pinned, setPinned] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) {
      setErrorMessage('Please select a course.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      setErrorMessage('Please fill in both the notice title and message.');
      return;
    }

    const cls = db.getClassById(classId);

    db.createAnnouncement({
      classId,
      className: cls?.name,
      classCode: cls?.code,
      teacherId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.title || 'Faculty Instructor',
      authorEmail: currentUser.email,
      title: title.trim(),
      content: content.trim(),
      priority,
      pinned
    });

    setSuccess(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Broadcast Announcement</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
              {errorMessage}
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Target Course *
            </label>
            <select
              required
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            >
              {classes.length === 0 && <option value="">No classes found</option>}
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm 1 Exam Room Assignments & Logistics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                Pin to top of feed
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Announcement Content *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Write the full announcement message to be shared with all enrolled students..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 leading-relaxed"
            />
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Announcement posted to class stream!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition-colors shadow-sm shadow-purple-200"
            >
              Broadcast Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
