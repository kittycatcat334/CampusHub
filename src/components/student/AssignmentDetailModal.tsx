import React, { useState } from 'react';
import { Assignment, DocumentItem, DocumentFileType } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { DocumentViewerModal } from '../common/DocumentViewerModal';
import { detectFileType, downloadDocumentFile } from '../../utils/documentViewerHelper';
import {
  X,
  Calendar,
  Clock,
  Award,
  Upload,
  Link as LinkIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  RotateCcw,
  ExternalLink,
  Paperclip,
  Eye,
  Download,
  Table,
  Sparkles
} from 'lucide-react';

interface AssignmentDetailModalProps {
  assignment: Assignment;
  onClose: () => void;
  onSubmissionSuccess?: () => void;
}

export const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  assignment,
  onClose,
  onSubmissionSuccess
}) => {
  const { currentUser } = useAuth();
  const course = db.getClassById(assignment.classId);
  const existingSubmission = db.getSubmissionForStudent(assignment.id, currentUser.id);

  // Form State
  const [submissionType, setSubmissionType] = useState<'file' | 'link' | 'text'>('file');
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [sampleFileName, setSampleFileName] = useState<string | null>(null);
  const [sampleFileType, setSampleFileType] = useState<DocumentFileType | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResubmitConfirm, setShowResubmitConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Document Viewer Modal State
  const [viewerDoc, setViewerDoc] = useState<DocumentItem | null>(null);

  const dueDate = new Date(assignment.dueDate);
  const isPastDue = dueDate.getTime() < new Date().getTime();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileInput(e.target.files[0]);
      setSampleFileName(null);
      setSampleFileType(null);
    }
  };

  const handleSelectSample = (name: string, type: DocumentFileType) => {
    setSampleFileName(name);
    setSampleFileType(type);
    setFileInput(null);
  };

  const handleOpenAttachment = (file: {
    name: string;
    url?: string;
    size?: string;
    type?: DocumentFileType;
    fileData?: string;
  }) => {
    const fType = file.type || detectFileType(file.name);
    setViewerDoc({
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
      fileName: file.name,
      fileType: fType,
      fileSize: file.size || '340 KB',
      fileData: file.fileData,
      authorName: course?.teacherName || 'Faculty Instructor',
      authorRole: 'teacher',
      courseName: course?.name,
      courseCode: course?.code,
      uploadedAt: assignment.createdAt
    });
  };

  const handleOpenMySubmission = () => {
    if (!existingSubmission) return;
    const fType = existingSubmission.fileType || detectFileType(existingSubmission.content);
    setViewerDoc({
      title: `${assignment.title} - My Submission`,
      fileName: existingSubmission.content,
      fileType: fType,
      fileSize: existingSubmission.fileSize || '320 KB',
      fileData: existingSubmission.fileData,
      authorName: currentUser.name,
      authorRole: 'student',
      courseName: course?.name,
      courseCode: course?.code,
      uploadedAt: existingSubmission.submittedAt
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let content = '';
    let fileSize: string | undefined = undefined;
    let fileType: DocumentFileType | undefined = undefined;

    if (submissionType === 'file') {
      if (fileInput) {
        content = fileInput.name;
        fileSize = `${(fileInput.size / (1024 * 1024)).toFixed(2)} MB`;
        fileType = detectFileType(fileInput.name, fileInput.type);
      } else if (sampleFileName) {
        content = sampleFileName;
        fileSize = sampleFileType === 'excel' ? '184 KB' : sampleFileType === 'word' ? '340 KB' : '480 KB';
        fileType = sampleFileType || detectFileType(sampleFileName);
      } else {
        alert('Please select or upload a document file to turn in.');
        return;
      }
    } else if (submissionType === 'link') {
      if (!linkUrl.trim()) {
        alert('Please enter your project or document link (e.g. GitHub, Google Drive).');
        return;
      }
      content = linkUrl.trim();
    } else {
      if (!textContent.trim()) {
        alert('Please enter your written submission text.');
        return;
      }
      content = textContent.trim();
    }

    setIsSubmitting(true);

    const performSave = (dataUrl?: string) => {
      try {
        db.submitWork(assignment.id, currentUser, {
          submissionType,
          content,
          fileSize,
          fileType,
          fileData: dataUrl
        });

        setSuccessMessage('Your assignment has been submitted successfully!');
        setShowResubmitConfirm(false);
        if (onSubmissionSuccess) onSubmissionSuccess();
      } catch (err) {
        console.error('Submission failed:', err);
        alert('Failed to submit assignment. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (fileInput) {
      const reader = new FileReader();
      reader.onload = () => {
        performSave(reader.result as string);
      };
      reader.onerror = () => {
        performSave();
      };
      reader.readAsDataURL(fileInput);
    } else {
      performSave();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
        <div
          className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/70">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {course?.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {course?.name}
                </span>
                {assignment.category && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {assignment.category}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {assignment.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            {/* Metadata Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Due Date</p>
                <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Points Possible</p>
                <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  {assignment.points} Points
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Current Status</p>
                <div className="mt-0.5">
                  {existingSubmission ? (
                    existingSubmission.status === 'reviewed' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Graded: {existingSubmission.grade}/{assignment.points}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-indigo-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                      </span>
                    )
                  ) : isPastDue ? (
                    <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                      <AlertCircle className="w-3.5 h-3.5" /> Overdue
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                      <Clock className="w-3.5 h-3.5" /> Pending Submission
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Instructions & Prompt</h3>
              <div className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 whitespace-pre-line">
                {assignment.description}
              </div>
            </div>

            {/* Attachments provided by instructor (Guides, Word Docs, Excel templates, PDFs) */}
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Class Handouts & Study Guides ({assignment.attachments.length})
                  </h3>
                  <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Click any file to open & read</span>
                  </span>
                </div>

                <div className="space-y-2.5">
                  {assignment.attachments.map((file, idx) => {
                    const fType = file.type || detectFileType(file.name);
                    const isExcel = fType === 'excel';
                    const isWord = fType === 'word';

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/90 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                              isExcel
                                ? 'bg-emerald-600 text-white'
                                : isWord
                                ? 'bg-blue-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {isExcel ? <Table className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {isExcel ? 'Excel Spreadsheet (.xlsx)' : isWord ? 'Word Document (.docx)' : 'PDF Study Guide (.pdf)'}
                              {file.size && ` • ${file.size}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenAttachment(file)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Open Guide</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadDocumentFile({
                              title: file.name,
                              fileName: file.name,
                              fileType: fType,
                              fileData: file.fileData
                            })}
                            className="p-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-600 transition-colors cursor-pointer"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Instructor Review Card if already graded */}
            {existingSubmission && existingSubmission.status === 'reviewed' && (
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-700" />
                    <span className="font-bold text-sm text-emerald-900">Instructor Evaluation</span>
                  </div>
                  <span className="text-base font-black px-3 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 shadow-xs">
                    {existingSubmission.grade} / {assignment.points} Points
                  </span>
                </div>

                {existingSubmission.feedback && (
                  <div className="text-xs text-emerald-950 bg-white/80 p-3 rounded-lg border border-emerald-100">
                    <p className="font-bold text-[11px] text-emerald-800 uppercase tracking-wider mb-1">Feedback:</p>
                    <p className="italic">"{existingSubmission.feedback}"</p>
                  </div>
                )}

                <p className="text-[11px] text-emerald-700 font-medium">
                  Reviewed by {existingSubmission.reviewedBy || 'Course Instructor'} &bull;{' '}
                  {existingSubmission.reviewedAt ? new Date(existingSubmission.reviewedAt).toLocaleDateString() : ''}
                </p>
              </div>
            )}

            {/* Existing Submission Details */}
            {existingSubmission && !showResubmitConfirm && (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-xs text-indigo-950">Your Submitted Work</h4>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-medium">
                    Turned in {new Date(existingSubmission.submittedAt).toLocaleString()}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      {existingSubmission.fileType === 'excel' ? (
                        <Table className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{existingSubmission.content}</p>
                      {existingSubmission.fileSize && (
                        <p className="text-[10px] text-slate-400">File size: {existingSubmission.fileSize}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {existingSubmission.submissionType === 'file' && (
                      <>
                        <button
                          type="button"
                          onClick={handleOpenMySubmission}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View My File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadDocumentFile({
                            title: existingSubmission.content,
                            fileName: existingSubmission.content,
                            fileType: existingSubmission.fileType || detectFileType(existingSubmission.content),
                            fileData: existingSubmission.fileData
                          })}
                          className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowResubmitConfirm(true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Resubmit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submission Form (Shown if not submitted or user chose to resubmit) */}
            {(!existingSubmission || showResubmitConfirm) && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    {showResubmitConfirm ? 'Resubmit Assignment' : 'Submit Your Work'}
                  </h4>
                  {showResubmitConfirm && (
                    <button
                      type="button"
                      onClick={() => setShowResubmitConfirm(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      Cancel Resubmission
                    </button>
                  )}
                </div>

                {/* Submission Type Selector */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <button
                    type="button"
                    onClick={() => setSubmissionType('file')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      submissionType === 'file'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> File Upload (PDF, Word, Excel)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmissionType('link')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      submissionType === 'link'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Link / Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmissionType('text')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      submissionType === 'text'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> Text
                  </button>
                </div>

                {/* Dynamic Input Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {submissionType === 'file' && (
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-white hover:border-indigo-400 transition-colors">
                        <input
                          type="file"
                          id="submission-file-input"
                          className="hidden"
                          accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.zip,.png,.jpg"
                          onChange={handleFileChange}
                        />
                        <label
                          htmlFor="submission-file-input"
                          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                        >
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Upload className="w-5 h-5" />
                          </div>
                          {fileInput ? (
                            <div>
                              <p className="text-xs font-bold text-indigo-900">{fileInput.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {(fileInput.size / 1024).toFixed(1)} KB &bull; Click to change file
                              </p>
                            </div>
                          ) : sampleFileName ? (
                            <div>
                              <p className="text-xs font-bold text-indigo-900">{sampleFileName}</p>
                              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                                Sample template selected &bull; Ready to submit
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                Click or drag your file here to upload
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Supports PDF (.pdf), Word (.docx), Excel (.xlsx / .csv)
                              </p>
                            </div>
                          )}
                        </label>
                      </div>

                      {/* Quick 1-Click Sample Upload Templates */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Or select a sample document for instant testing:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectSample('Alex_Rivera_Research_Report.pdf', 'pdf')}
                            className={`p-2 rounded-xl text-left border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                              sampleFileName === 'Alex_Rivera_Research_Report.pdf'
                                ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                            <span className="truncate">Sample PDF Report</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectSample('Alex_Rivera_Lab3_Analysis.docx', 'word')}
                            className={`p-2 rounded-xl text-left border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                              sampleFileName === 'Alex_Rivera_Lab3_Analysis.docx'
                                ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="truncate">Sample Word (.docx)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectSample('Alex_Rivera_Calculations_Data.xlsx', 'excel')}
                            className={`p-2 rounded-xl text-left border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                              sampleFileName === 'Alex_Rivera_Calculations_Data.xlsx'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Table className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">Sample Excel (.xlsx)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {submissionType === 'link' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Repository or Shared Document Link
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://github.com/username/project or Google Drive link"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {submissionType === 'text' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Written Response / Code Snippet
                      </label>
                      <textarea
                        rows={5}
                        required
                        placeholder="Type or paste your answers, analysis, or explanations here..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Submitting...' : 'Turn In Work'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Modal for inspecting guide files, Word, Excel, or PDF submissions */}
      {viewerDoc && (
        <DocumentViewerModal
          document={viewerDoc}
          onClose={() => setViewerDoc(null)}
        />
      )}
    </>
  );
};
