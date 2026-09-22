import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Assignment } from '../../types';
import { X, FileCheck2, Calendar, Award, CheckCircle2 } from 'lucide-react';

interface CreateAssignmentModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialClassId?: string;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  onClose,
  onSuccess,
  initialClassId
}) => {
  const { currentUser } = useAuth();
  const classes = db.getTeacherClasses(currentUser.id);

  const [classId, setClassId] = useState<string>(initialClassId || (classes[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-09-25T23:59');
  const [points, setPoints] = useState<number>(100);
  const [category, setCategory] = useState<Assignment['category']>('Homework');
  const [attachmentName, setAttachmentName] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) {
      alert('Please select a course.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      alert('Please provide title and description.');
      return;
    }

    db.createAssignment({
      classId,
      teacherId: currentUser.id,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      points: Number(points),
      category,
      attachments: attachmentName.trim()
        ? [{ name: attachmentName.trim(), url: '#', size: '1.2 MB' }]
        : []
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
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Create Assignment</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Select Course *
            </label>
            <select
              required
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            >
              {classes.length === 0 && <option value="">No classes found (Create one first)</option>}
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Problem Set 3: Graph Traversal & Dijkstra's Algorithm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Assignment['category'])}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="Homework">Homework</option>
                <option value="Lab">Lab</option>
                <option value="Project">Project</option>
                <option value="Essay">Essay</option>
                <option value="Quiz">Quiz</option>
                <option value="Exam">Exam</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Points Possible
              </label>
              <input
                type="number"
                min={1}
                required
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Instructions & Grading Rubric *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Outline the required methodology, formatting expectations, submission guidelines, and grading criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Starter Kit or Handout File (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. GraphLab_StarterFiles.zip"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Assignment published to students!</span>
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
              Publish Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
