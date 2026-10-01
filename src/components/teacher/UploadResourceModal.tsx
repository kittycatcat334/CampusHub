import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { ClassResource, ResourceCategory } from '../../types';
import { detectFileType } from '../../utils/documentViewerHelper';
import {
  X,
  FolderArchive,
  CheckCircle2,
  Upload,
  FileText,
  Table,
  Sparkles,
  Paperclip
} from 'lucide-react';

interface UploadResourceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialClassId?: string;
}

export const UploadResourceModal: React.FC<UploadResourceModalProps> = ({
  onClose,
  onSuccess,
  initialClassId
}) => {
  const { currentUser } = useAuth();
  const classes = currentUser?.role === 'admin' ? db.getClasses() : db.getTeacherClasses(currentUser.id);

  const [classId, setClassId] = useState<string>(initialClassId || (classes[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Lecture Notes');
  const [fileType, setFileType] = useState<ClassResource['fileType']>('pdf');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('380 KB');
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);

  const handleSelectSampleGuide = (guide: {
    title: string;
    description: string;
    category: ResourceCategory;
    fileType: 'pdf' | 'word' | 'excel';
    fileName: string;
    fileSize: string;
  }) => {
    setTitle(guide.title);
    setDescription(guide.description);
    setCategory(guide.category);
    setFileType(guide.fileType);
    setFileName(guide.fileName);
    setFileSize(guide.fileSize);
    setFileData(undefined);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const detected = detectFileType(file.name, file.type);
      setFileName(file.name);
      setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      setFileType(detected === 'excel' ? 'excel' : detected === 'word' ? 'word' : 'pdf');

      if (!title.trim()) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) {
      alert('Please select a course.');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a title for the resource.');
      return;
    }

    const cls = db.getClassById(classId);

    db.createResource({
      classId,
      className: cls?.name,
      classCode: cls?.code,
      teacherId: currentUser.id,
      title: title.trim(),
      description: description.trim(),
      category,
      fileType,
      fileName: fileName.trim() || `${title.trim()}.${fileType === 'excel' ? 'xlsx' : fileType === 'word' ? 'docx' : 'pdf'}`,
      url: '#',
      fileSize: fileSize.trim(),
      fileData
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
              <FolderArchive className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Upload Course Guide & Material</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Quick-select Pre-made Guides */}
          <div className="space-y-1.5 p-3 bg-purple-50/60 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Quick-Select Course Guide Template
              </span>
              <span className="text-[10px] text-purple-600 font-medium">1-Click Fill</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleSelectSampleGuide({
                    title: 'Official Course Syllabus & Academic Policies',
                    description: 'Comprehensive course overview, grading scale, office hours, and academic integrity policies.',
                    category: 'Syllabus',
                    fileType: 'pdf',
                    fileName: 'Official_Course_Syllabus.pdf',
                    fileSize: '340 KB'
                  })
                }
                className="p-2 rounded-lg bg-white border border-purple-200 hover:border-purple-400 text-left font-semibold text-slate-800 text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">Syllabus Guide (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectSampleGuide({
                    title: 'Project Methodology & Grading Rubric',
                    description: 'Formal architectural requirements, evaluation rubrics, and submission packaging guidelines.',
                    category: 'Assignments',
                    fileType: 'word',
                    fileName: 'Project_Rubric_Specifications.docx',
                    fileSize: '380 KB'
                  })
                }
                className="p-2 rounded-lg bg-white border border-purple-200 hover:border-purple-400 text-left font-semibold text-slate-800 text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">Rubric Spec (Word)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectSampleGuide({
                    title: 'Grading Criteria & Statistical Weighting Model',
                    description: 'Course grade calculator, weighting breakdowns, and cohort statistical distribution formulas.',
                    category: 'Exam Prep',
                    fileType: 'excel',
                    fileName: 'Grade_Weighting_Model.xlsx',
                    fileSize: '195 KB'
                  })
                }
                className="p-2 rounded-lg bg-white border border-purple-200 hover:border-purple-400 text-left font-semibold text-slate-800 text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                <Table className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Grading Model (Excel)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectSampleGuide({
                    title: 'Laboratory Protocols & Equipment Safety Guide',
                    description: 'Safety protocols, experimental circuit guidelines, and benchtop equipment operating procedures.',
                    category: 'Readings',
                    fileType: 'pdf',
                    fileName: 'Lab_Protocols_Manual.pdf',
                    fileSize: '410 KB'
                  })
                }
                className="p-2 rounded-lg bg-white border border-purple-200 hover:border-purple-400 text-left font-semibold text-slate-800 text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">Safety Guide (PDF)</span>
              </button>
            </div>
          </div>

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
              Resource Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Official Course Syllabus & Academic Integrity Policy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="Syllabus">Syllabus</option>
                <option value="Lecture Notes">Lecture Notes</option>
                <option value="Assignments">Assignments</option>
                <option value="Readings">Readings</option>
                <option value="Exam Prep">Exam Prep</option>
                <option value="Software & Tools">Software & Tools</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Document Format
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as ClassResource['fileType'])}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="word">Word Document (.docx)</option>
                <option value="excel">Excel Spreadsheet (.xlsx)</option>
                <option value="slide">Slide Deck (.pdf / .pptx)</option>
                <option value="code">Code Repository (.zip)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Brief Description & Overview
            </label>
            <textarea
              rows={2}
              placeholder="Summary of topics covered, required readings, or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 leading-relaxed"
            />
          </div>

          {/* Upload Actual Document File */}
          <div className="space-y-1.5 p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <label className="block text-xs font-bold text-slate-700">
              Upload Document File (.pdf, .docx, .xlsx)
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose File</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
              </label>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {fileName || 'No file selected (will use template)'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {fileSize} &bull; Opens directly in CampusHub document viewer
                </p>
              </div>
            </div>
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Guide published! Students and teachers can now open and read it.</span>
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
              Publish Guide
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
