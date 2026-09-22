import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { ClassResource, ResourceCategory, UniversityClass } from '../../types';
import {
  FolderArchive,
  Search,
  Filter,
  FileText,
  FileCode,
  Sliders,
  ExternalLink,
  Download,
  BookOpen,
  Folder,
  FolderOpen,
  Eye,
  X,
  Sparkles,
  Layers,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Copy,
  Maximize2
} from 'lucide-react';

interface StudentResourcesProps {
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string | null) => void;
}

export const StudentResources: React.FC<StudentResourcesProps> = ({
  selectedCourseId,
  onSelectCourse
}) => {
  const { currentUser } = useAuth();
  const enrolledClasses = db.getStudentClasses(currentUser.id);
  const enrolledClassIds = new Set(enrolledClasses.map(c => c.id));
  const resources = db.getResources().filter(r => enrolledClassIds.has(r.classId));

  const [activeSubjectId, setActiveSubjectId] = useState<string>(selectedCourseId || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // "New Window" Document Viewer Modal State
  const [previewResource, setPreviewResource] = useState<ClassResource | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (selectedCourseId) {
      setActiveSubjectId(selectedCourseId);
    }
  }, [selectedCourseId]);

  const categories: ResourceCategory[] = [
    'Syllabus',
    'Lecture Notes',
    'Assignments',
    'Readings',
    'Exam Prep',
    'Software & Tools'
  ];

  // Group resources by subject (enrolled classes)
  const resourcesBySubject = enrolledClasses.map(cls => {
    const subjectFiles = resources.filter(r => r.classId === cls.id);
    return {
      course: cls,
      files: subjectFiles
    };
  });

  // Filtered files according to current selection
  const filtered = resources.filter(res => {
    if (activeSubjectId !== 'all' && res.classId !== activeSubjectId) return false;
    if (selectedCategory !== 'all' && res.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = res.title.toLowerCase().includes(q);
      const matchDesc = res.description ? res.description.toLowerCase().includes(q) : false;
      const matchClass = res.classCode?.toLowerCase().includes(q) || res.className?.toLowerCase().includes(q);
      const matchTopic = res.topic ? res.topic.toLowerCase().includes(q) : false;
      return matchTitle || matchDesc || matchClass || matchTopic;
    }
    return true;
  });

  const getFileIcon = (fileType: ClassResource['fileType']) => {
    switch (fileType) {
      case 'slide':
        return <Sliders className="w-5 h-5 text-indigo-500" />;
      case 'code':
      case 'zip':
        return <FileCode className="w-5 h-5 text-emerald-500" />;
      case 'link':
        return <ExternalLink className="w-5 h-5 text-sky-500" />;
      default:
        return <FileText className="w-5 h-5 text-rose-500" />;
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Space_Grotesk']">
              Class Resources & Course Files
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              <FolderArchive className="w-3.5 h-3.5" />
              Arranged by Subject
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse course syllabi, lecture slide decks, starter source code, and formula sheets arranged neatly by subject.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            {resources.length} Total Course Files
          </span>
        </div>
      </div>

      {/* SUBJECT FOLDERS TABS (Arranged According to Subjects) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4 text-indigo-600" />
            Subject Folders
          </span>
          {activeSubjectId !== 'all' && (
            <button
              onClick={() => {
                setActiveSubjectId('all');
                if (onSelectCourse) onSelectCourse(null);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Show All Subjects
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* All Subjects pill */}
          <button
            type="button"
            onClick={() => {
              setActiveSubjectId('all');
              if (onSelectCourse) onSelectCourse(null);
            }}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
              activeSubjectId === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-500/20'
                : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <FolderArchive className={`w-4 h-4 ${activeSubjectId === 'all' ? 'text-indigo-200' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${activeSubjectId === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {resources.length}
              </span>
            </div>
            <div className="mt-2">
              <span className="text-xs font-bold block truncate">All Subjects</span>
              <span className={`text-[10px] ${activeSubjectId === 'all' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {enrolledClasses.length} Courses
              </span>
            </div>
          </button>

          {/* Each subject card */}
          {resourcesBySubject.map(({ course, files }) => {
            const isSelected = activeSubjectId === course.id;

            return (
              <button
                key={course.id}
                type="button"
                onClick={() => {
                  setActiveSubjectId(course.id);
                  if (onSelectCourse) onSelectCourse(course.id);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Folder className={`w-4 h-4 ${isSelected ? 'text-indigo-200' : 'text-indigo-600'}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {files.length}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold block truncate">{course.code}</span>
                  <span className={`text-[10px] block truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {course.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search file name, topic (e.g. Trees, Gauss, SQL), or keywords..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Document Types</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ARRANGED FILES BY SUBJECT ACCORDING TO VIEW */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No course materials found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting another subject folder.
          </p>
          <button
            onClick={() => {
              setActiveSubjectId('all');
              setSelectedCategory('all');
              setSearchQuery('');
              if (onSelectCourse) onSelectCourse(null);
            }}
            className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl"
          >
            Show All Resources
          </button>
        </div>
      ) : activeSubjectId === 'all' ? (
        // When all subjects are selected, display arranged clearly into Subject Sections
        <div className="space-y-6">
          {resourcesBySubject.map(({ course, files }) => {
            const subjectFiltered = files.filter(f => {
              if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return f.title.toLowerCase().includes(q) || (f.description && f.description.toLowerCase().includes(q));
              }
              return true;
            });

            if (subjectFiltered.length === 0) return null;

            return (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                {/* Subject Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {course.code}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{course.name}</h3>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Instructor: {course.teacherName} • {subjectFiltered.length} files
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveSubjectId(course.id);
                      if (onSelectCourse) onSelectCourse(course.id);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    View Subject Folder →
                  </button>
                </div>

                {/* Files Grid for this subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {subjectFiltered.map(res => (
                    <div
                      key={res.id}
                      onClick={() => setPreviewResource(res)}
                      className="group p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer bg-slate-50/40 hover:bg-white flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white text-indigo-700 border border-slate-200">
                            {res.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {res.fileSize || 'PDF'}
                          </span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0 group-hover:border-indigo-300 transition-colors">
                            {getFileIcon(res.fileType)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                              {res.title}
                            </h4>
                            {res.topic && (
                              <span className="text-[11px] text-slate-500 font-medium block truncate mt-0.5">
                                Topic: {res.topic}
                              </span>
                            )}
                          </div>
                        </div>

                        {res.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {res.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                        <span className="text-slate-400">
                          {new Date(res.uploadedAt).toLocaleDateString()}
                        </span>
                        <span className="text-indigo-600 font-bold inline-flex items-center gap-1 group-hover:underline">
                          <Eye className="w-3 h-3" />
                          Open File Window
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // When a single subject folder is open
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
              Subject Files ({filtered.length} Resources)
            </h2>
            <button
              onClick={() => {
                setActiveSubjectId('all');
                if (onSelectCourse) onSelectCourse(null);
              }}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              ← Back to All Subject Folders
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(res => (
              <div
                key={res.id}
                onClick={() => setPreviewResource(res)}
                className="group p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {res.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">
                      {res.fileSize || 'PDF'}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 group-hover:border-indigo-300 transition-colors">
                      {getFileIcon(res.fileType)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {res.title}
                      </h4>
                      {res.topic && (
                        <span className="text-xs text-indigo-600 font-semibold block mt-0.5">
                          {res.topic}
                        </span>
                      )}
                    </div>
                  </div>

                  {res.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium">
                    {new Date(res.uploadedAt).toLocaleDateString()}
                  </span>
                  <span className="text-indigo-600 font-bold inline-flex items-center gap-1 group-hover:underline">
                    <Eye className="w-3.5 h-3.5" />
                    Open File Window
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEDICATED RESOURCE WINDOW / PREVIEW MODAL */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Window Top Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
              <button
                onClick={() => setPreviewResource(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close Window"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded bg-indigo-500/40 text-indigo-200 border border-indigo-400/40">
                  {previewResource.classCode}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-amber-300">
                  {previewResource.category}
                </span>
                {previewResource.fileSize && (
                  <span className="text-xs text-slate-300">• {previewResource.fileSize}</span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {previewResource.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Course: {previewResource.className} • Instructor: {previewResource.teacherName || 'Faculty'}
              </p>
            </div>

            {/* Modal Body: Document Preview & Details */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {previewResource.description && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Document Overview
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {previewResource.description}
                  </p>
                </div>
              )}

              {/* Content Preview Block */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Document Content Preview
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Type: {previewResource.fileType.toUpperCase()}
                  </span>
                </div>

                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner max-h-72">
                  {previewResource.contentPreview ||
                    `// ${previewResource.title}\n// Department of Computer Science & Engineering\n// Verified official coursework material\n\n[Full file available for download or external web viewing via the actions below]`}
                </div>
              </div>

              {/* File Meta Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">CATEGORY</span>
                  <span className="font-semibold text-slate-800">{previewResource.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">TOPIC</span>
                  <span className="font-semibold text-slate-800">{previewResource.topic || 'General'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">UPLOAD DATE</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(previewResource.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">FORMAT</span>
                  <span className="font-semibold text-slate-800 uppercase">{previewResource.fileType}</span>
                </div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(previewResource.url)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                >
                  {copiedUrl ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedUrl ? 'URL Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewResource(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Close Window
                </button>

                <a
                  href={previewResource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Resource</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
