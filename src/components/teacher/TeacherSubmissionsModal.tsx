import React, { useState } from 'react';
import { Submission, Assignment, UniversityClass, DocumentItem } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { DocumentViewerModal } from '../common/DocumentViewerModal';
import { detectFileType, downloadDocumentFile } from '../../utils/documentViewerHelper';
import {
  X,
  Award,
  CheckCircle2,
  Paperclip,
  Link as LinkIcon,
  FileText,
  Clock,
  ExternalLink,
  MessageSquare,
  Eye,
  Download,
  Table,
  Sparkles
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
  const [viewerDoc, setViewerDoc] = useState<DocumentItem | null>(null);

  const isLate = new Date(submission.submittedAt).getTime() > new Date(assignment.dueDate).getTime();
  const fileType = submission.fileType || detectFileType(submission.content);

  const handleOpenDocument = () => {
    const docItem: DocumentItem = {
      title: `${assignment.title} - ${submission.studentName}'s Submission`,
      fileName: submission.content,
      fileType: fileType,
      fileSize: submission.fileSize || '380 KB',
      fileData: submission.fileData,
      authorName: submission.studentName,
      authorRole: 'student',
      courseName: course?.name,
      courseCode: course?.code,
      uploadedAt: submission.submittedAt
    };
    setViewerDoc(docItem);
  };

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
    <>
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
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Submitted Student Material
                </h3>
                {submission.submissionType === 'file' && (
                  <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Ready for Document Inspection</span>
                  </span>
                )}
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    {fileType === 'excel' ? (
                      <Table className="w-4 h-4 text-emerald-600" />
                    ) : fileType === 'word' ? (
                      <FileText className="w-4 h-4 text-blue-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      {fileType === 'excel'
                        ? 'EXCEL SPREADSHEET'
                        : fileType === 'word'
                        ? 'MICROSOFT WORD DOCUMENT'
                        : fileType === 'pdf'
                        ? 'PDF DOCUMENT'
                        : submission.submissionType.toUpperCase()}
                    </span>
                  </div>
                  {submission.fileSize && (
                    <span className="text-[11px] font-semibold text-slate-400">{submission.fileSize}</span>
                  )}
                </div>

                {submission.submissionType === 'link' ? (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
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
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                          fileType === 'excel'
                            ? 'bg-emerald-600 text-white'
                            : fileType === 'word'
                            ? 'bg-blue-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {fileType === 'excel' ? <Table className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono font-bold text-slate-900 truncate">{submission.content}</p>
                        <p className="text-[11px] text-slate-500">
                          {fileType === 'excel'
                            ? 'Spreadsheet Workbook (.xlsx / .csv)'
                            : fileType === 'word'
                            ? 'Word Document (.docx)'
                            : 'Portable Document (.pdf)'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleOpenDocument}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Open & Review</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadDocumentFile({
                          title: assignment.title,
                          fileName: submission.content,
                          fileType: fileType,
                          fileData: submission.fileData
                        })}
                        className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
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
                      required
                      min={0}
                      max={assignment.points * 1.5}
                      value={grade}
                      onChange={(e) => setGrade(parseFloat(e.target.value))}
                      className="w-full text-sm font-bold pl-3 pr-12 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      / {assignment.points}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <button
                    type="button"
                    onClick={() => setGrade(assignment.points)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    Full Points ({assignment.points})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrade(Math.round(assignment.points * 0.9))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    90% ({Math.round(assignment.points * 0.9)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrade(Math.round(assignment.points * 0.8))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    80% ({Math.round(assignment.points * 0.8)})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Instructor Feedback & Comments
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback, point deductions rationale, or commendations..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 leading-relaxed"
                />
              </div>

              {successNote && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Evaluation recorded successfully! Synced to gradebook.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition-colors shadow-sm shadow-purple-200 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>{isSaving ? 'Recording Grade...' : 'Save Evaluation & Post Grade'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal for inspecting submitted PDF, Word, or Excel files */}
      {viewerDoc && (
        <DocumentViewerModal
          document={viewerDoc}
          onClose={() => setViewerDoc(null)}
        />
      )}
    </>
  );
};
