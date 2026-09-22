import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { ClassResource, ResourceCategory } from '../../types';
import { X, FolderArchive, CheckCircle2 } from 'lucide-react';

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
  const classes = db.getTeacherClasses(currentUser.id);

  const [classId, setClassId] = useState<string>(initialClassId || (classes[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Lecture Notes');
  const [fileType, setFileType] = useState<ClassResource['fileType']>('pdf');
  const [url, setUrl] = useState('https://example.edu/course_materials/download');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [success, setSuccess] = useState(false);

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
      url: url.trim(),
      fileSize: fileSize.trim()
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
            <h3 className="font-bold text-slate-900 text-base">Upload Course Resource</h3>
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
              placeholder="e.g. Lecture 06: Graph Algorithms & Minimum Spanning Trees"
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
                Resource Type
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as ClassResource['fileType'])}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="pdf">PDF Document</option>
                <option value="slide">Slide Deck (.pptx, .pdf)</option>
                <option value="link">Web Link / Repo</option>
                <option value="code">Code Repository (.zip)</option>
                <option value="document">Word Doc (.docx)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Brief Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Summary of topics covered, required readings, or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              File Path or External URL
            </label>
            <input
              type="text"
              placeholder="https://example.edu/cs201/lecture06.pdf"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resource published to class portal!</span>
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
              Publish Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
