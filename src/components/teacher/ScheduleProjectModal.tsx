import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Assignment, ProjectMilestone } from '../../types';
import {
  X,
  Calendar,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  Rocket,
  FileText,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface ScheduleProjectModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialClassId?: string;
}

export const ScheduleProjectModal: React.FC<ScheduleProjectModalProps> = ({
  onClose,
  onSuccess,
  initialClassId
}) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const classes = db.getTeacherClasses(currentUser.id);

  // Form State
  const [deliverableType, setDeliverableType] = useState<'project' | 'assignment'>('project');
  const [classId, setClassId] = useState<string>(initialClassId || (classes[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Assignment['category']>('Project');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState<number>(150);

  // Scheduling fields
  const [publishScheduleType, setPublishScheduleType] = useState<'immediate' | 'scheduled'>('scheduled');
  const [publishDate, setPublishDate] = useState('2026-09-20T08:00');
  const [dueDate, setDueDate] = useState('2026-10-15T23:59');

  // Project Milestones
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([
    {
      id: 'm-1',
      title: 'Phase 1: Architecture RFC & Technical Proposal',
      dueDate: '2026-09-27T23:59',
      points: 30,
      completed: false
    },
    {
      id: 'm-2',
      title: 'Phase 2: Working MVP & Integration Tests',
      dueDate: '2026-10-08T23:59',
      points: 50,
      completed: false
    },
    {
      id: 'm-3',
      title: 'Final Phase: Production Release & Team Presentation',
      dueDate: '2026-10-15T23:59',
      points: 70,
      completed: false
    }
  ]);

  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('2026-10-01T23:59');
  const [newMilestonePoints, setNewMilestonePoints] = useState<number>(25);

  const [attachmentName, setAttachmentName] = useState('Project_Specification_Guide.pdf');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    const newM: ProjectMilestone = {
      id: `m-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      dueDate: newMilestoneDate,
      points: Number(newMilestonePoints) || 20,
      completed: false
    };
    setMilestones([...milestones, newM]);
    setNewMilestoneTitle('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!classId) {
      setError('Please select a course to assign this deliverable to.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError('Please enter both a title and description for this scheduled work.');
      return;
    }

    // Create assignment or project in db
    db.createAssignment({
      classId,
      teacherId: currentUser.id,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      points: Number(points),
      category: deliverableType === 'project' ? 'Project' : category,
      publishDate: publishScheduleType === 'scheduled' ? publishDate : undefined,
      isScheduled: publishScheduleType === 'scheduled',
      milestones: deliverableType === 'project' ? milestones : undefined,
      attachments: attachmentName.trim()
        ? [{ name: attachmentName.trim(), url: '#', size: '2.4 MB' }]
        : []
    });

    setSuccess(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg font-['Space_Grotesk']">
                  Schedule Assignment or Project
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Faculty Planner
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Plan ahead, set future release windows, and define project milestones.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Successfully Scheduled!</p>
                <p className="text-emerald-700 mt-0.5">
                  The {deliverableType} has been scheduled for your students.
                </p>
              </div>
            </div>
          )}

          {/* Type Toggle: Project vs Assignment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Deliverable Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeliverableType('project');
                  setCategory('Project');
                  if (!title) setTitle('Term Project: Distributed Architecture');
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  deliverableType === 'project'
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2 rounded-xl ${deliverableType === 'project' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Course Project</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Multi-phase project with checkpoints & milestones
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeliverableType('assignment');
                  setCategory('Homework');
                  if (!title) setTitle('Problem Set 3: Complexity & Heaps');
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  deliverableType === 'assignment'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2 rounded-xl ${deliverableType === 'assignment' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Standard Assignment</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Problem sets, lab reports, essays, quizzes
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Course Selection & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Course Section *
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name} ({c.section})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="Project">Term Project</option>
                <option value="Homework">Homework / Problem Set</option>
                <option value="Lab">Laboratory Assignment</option>
                <option value="Quiz">Midterm / Quiz</option>
                <option value="Essay">Report / Essay</option>
              </select>
            </div>
          </div>

          {/* Title & Total Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {deliverableType === 'project' ? 'Project Title *' : 'Assignment Title *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={deliverableType === 'project' ? 'e.g. Distributed Key-Value Store Project' : 'e.g. Assignment 4: Binary Trees'}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Total Point Value
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                  pts
                </span>
              </div>
            </div>
          </div>

          {/* Scheduling Timing Configuration */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Clock className="w-4 h-4 text-purple-700" />
              <span>Schedule & Timeline Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Release Schedule */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  When should students see this?
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setPublishScheduleType('immediate')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      publishScheduleType === 'immediate'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Publish Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setPublishScheduleType('scheduled')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      publishScheduleType === 'scheduled'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Schedule Date
                  </button>
                </div>

                {publishScheduleType === 'scheduled' && (
                  <div>
                    <input
                      type="datetime-local"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Students will be notified at this scheduled release time.
                    </p>
                  </div>
                )}
              </div>

              {/* Submission Deadline */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Final Submission Deadline *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Calculates urgency and flags overdue submissions.
                </p>
              </div>
            </div>
          </div>

          {/* Project Milestones Section (Only for Projects) */}
          {deliverableType === 'project' && (
            <div className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-700" />
                  <span className="text-xs font-bold text-slate-900 font-['Space_Grotesk']">
                    Project Phase Milestones
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {milestones.length} Milestones Configured
                </span>
              </div>

              {/* Milestone items list */}
              <div className="space-y-2">
                {milestones.map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-3 bg-white rounded-xl border border-purple-100 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{m.title}</p>
                        <p className="text-[10px] text-slate-500">
                          Due {new Date(m.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} &bull; {m.points} pts
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(m.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Milestone Form */}
              <div className="pt-2 border-t border-purple-100/80 grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Next milestone title (e.g. Phase 4: Security Audit)"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="sm:col-span-6 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="datetime-local"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="sm:col-span-3 text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="number"
                  placeholder="Pts"
                  value={newMilestonePoints}
                  onChange={(e) => setNewMilestonePoints(Number(e.target.value))}
                  className="sm:col-span-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="sm:col-span-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 py-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          )}

          {/* Description & Requirements */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deliverable Description & Rubric Instructions *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide clear problem specs, grading criteria, submission formatting rules, and learning objectives..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          {/* Starter Material Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Starter Code or Specification Attachment
            </label>
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="e.g. Project_Specification_Guide.pdf or starter_code.zip"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={success}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              <span>
                {deliverableType === 'project' ? 'Schedule Course Project' : 'Schedule Assignment'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
