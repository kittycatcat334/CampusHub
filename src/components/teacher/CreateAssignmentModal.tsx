import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Assignment, DocumentFileType } from '../../types';
import { detectFileType } from '../../utils/documentViewerHelper';
import {
  X,
  FileCheck2,
  Calendar,
  Award,
  CheckCircle2,
  Paperclip,
  Upload,
  FileText,
  Table,
  Plus,
  Trash2
} from 'lucide-react';

interface CreateAssignmentModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialClassId?: string;
}

interface AttachedGuideItem {
  name: string;
  size: string;
  type: DocumentFileType;
  fileData?: string;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  onClose,
  onSuccess,
  initialClassId
}) => {
  const { currentUser } = useAuth();
  const classes = currentUser?.role === 'admin' ? db.getClasses() : db.getTeacherClasses(currentUser.id);

  const [classId, setClassId] = useState<string>(initialClassId || (classes[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-09-25T23:59');
  const [points, setPoints] = useState<number>(100);
  const [category, setCategory] = useState<Assignment['category']>('Homework');
  const [attachments, setAttachments] = useState<AttachedGuideItem[]>([]);
  const [customFileName, setCustomFileName] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAddSampleGuide = (name: string, type: DocumentFileType, size: string) => {
    if (attachments.some(a => a.name === name)) return;
    setAttachments(prev => [...prev, { name, type, size }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fType = detectFileType(file.name, file.type);
      const fSize = `${(file.size / 1024).toFixed(1)} KB`;

      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type: fType,
            size: fSize,
            fileData: reader.result as string
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomName = () => {
    if (!customFileName.trim()) return;
    const name = customFileName.trim();
    const fType = detectFileType(name);
    setAttachments(prev => [...prev, { name, type: fType, size: '350 KB' }]);
    setCustomFileName('');
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

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
      attachments: attachments.map(a => ({
        name: a.name,
        url: '#',
        size: a.size,
        type: a.type,
        fileData: a.fileData
      }))
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
              rows={3}
              required
              placeholder="Outline the required methodology, formatting expectations, submission guidelines, and grading criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 leading-relaxed"
            />
          </div>

          {/* Attachments Section (Guides, Word Docs, Excel Spreadsheets, PDFs) */}
          <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                Handouts, Study Guides & Templates ({attachments.length})
              </label>
              <span className="text-[10px] text-slate-500">Students can open directly</span>
            </div>

            {/* Attached Items List */}
            {attachments.length > 0 && (
              <div className="space-y-1.5">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {att.type === 'excel' ? (
                        <Table className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : att.type === 'word' ? (
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-800 truncate">{att.name}</span>
                      <span className="text-[10px] text-slate-400">({att.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick 1-Click Guide Attachments */}
            <div className="pt-1 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick-add sample guides & templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddSampleGuide('Study_Guide_&_Problem_Prompts.pdf', 'pdf', '420 KB')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-rose-500" />
                  <span>+ Study Guide (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSampleGuide('Assignment_Rubric_Specifications.docx', 'word', '340 KB')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-blue-500" />
                  <span>+ Rubric Specs (Word)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSampleGuide('Benchmark_Data_Template.xlsx', 'excel', '180 KB')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Table className="w-3 h-3 text-emerald-500" />
                  <span>+ Data Model (Excel)</span>
                </button>
              </div>
            </div>

            {/* Upload from Computer */}
            <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-purple-600" />
                <span>Upload from Device (.pdf, .docx, .xlsx)</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                />
              </label>

              <div className="flex-1 flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Or custom file name..."
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                {customFileName.trim() && (
                  <button
                    type="button"
                    onClick={handleAddCustomName}
                    className="p-1.5 rounded-lg bg-purple-700 text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Assignment with study guides published to students!</span>
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
