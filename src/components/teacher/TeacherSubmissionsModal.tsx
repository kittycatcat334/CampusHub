import React, { useState } from 'react';
import { Submission, Assignment, UniversityClass } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Award,
  CheckCircle2,
  Paperclip,
  Link as LinkIcon,
  FileText,
  Clock,
  User,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface TeacherSubmissionsModalProps {
  submission: Submission;
  assignment: Assignment;
  course?: UniversityClass;
  onClose: () => void;
  onGradedSuccess?: () => void;
}

export const TeacherSubmissionsModal: React.FC<TeacherSubmissionsModalProps> = ({
  submission,
  assignment,
  course,
  onClose,
  onGradedSuccess
}) => {
  const { currentUser } = useAuth();
  const [grade, setGrade] = useState<number>(submission.grade ?? assignment.points);
  const [feedback, setFeedback] = useState<string>(submission.feedback ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [successNote, setSuccessNote] = useState(false);

  const isLate = new Date(submission.submittedAt).getTime() > new Date(assignment.dueDate).getTime();

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (grade < 0 || isNaN(grade)) {
      alert('Please enter a valid numeric grade.');
      return;
    }

    setIsSaving(true);
    try {
      db.reviewSubmission(submission.id, {
        grade: Number(grade),
        feedback: feedback.trim(),
        reviewedBy: currentUser.name
      });
      setSuccessNote(true);
      setTimeout(() => {
        if (onGradedSuccess) onGradedSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to review submission:', err);
      alert('Failed to save evaluation.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                {course?.code}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {course?.name}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Grade Submission: {assignment.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Maximum possible: <span className="font-bold text-slate-700">{assignment.points} Points</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Student Info Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                {submission.studentName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{submission.studentName}</p>
                <p className="text-slate-500">{submission.studentEmail}</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="font-semibold text-slate-700 flex items-center sm:justify-end gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Turned in: {new Date(submission.submittedAt).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {isLate ? (
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Submitted Late
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Submitted On-Time
                </span>
              )}
            </div>
          </div>

          {/* Submission Content Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Submitted Work Material
            </h3>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  {submission.submissionType === 'file' ? (
                    <Paperclip className="w-4 h-4 text-purple-600" />
                  ) : submission.submissionType === 'link' ? (
                    <LinkIcon className="w-4 h-4 text-purple-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-purple-600" />
                  )}
                  <span>Type: {submission.submissionType.toUpperCase()}</span>
                </div>
                {submission.fileSize && (
                  <span className="text-[11px] text-slate-400">{submission.fileSize}</span>
                )}
              </div>

              {submission.submissionType === 'link' ? (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <a
                    href={submission.content}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline font-mono truncate max-w-md"
                  >
                    {submission.content}
                  </a>
                  <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ) : submission.submissionType === 'file' ? (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-800">{submission.content}</span>
                  <button
                    type="button"
                    onClick={() => alert(`Simulating review inspection of ${submission.content}`)}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 px-3 py-1 bg-white rounded border border-purple-200"
                  >
                    Inspect File
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {submission.content}
                </div>
              )}
            </div>
          </div>

          {/* Grading Form */}
          <form onSubmit={handleSaveReview} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Awarded Score (out of {assignment.points})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={assignment.points * 1.5}
                    step={0.5}
                    required
                    value={grade}
                    onChange={(e) => setGrade(parseFloat(e.target.value))}
                    className="w-full text-base font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    / {assignment.points} pts
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Status
                </label>
                <div className="py-2.5 px-3.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mark as Reviewed</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Instructor Feedback & Comments
              </label>
              <textarea
                rows={3}
                placeholder="Provide constructive feedback, notes on methodology, or rubric criteria comments..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 leading-relaxed"
              />
            </div>

            {successNote && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Grade and feedback recorded successfully!</span>
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
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition-colors shadow-sm shadow-purple-200"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Grade & Feedback'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
