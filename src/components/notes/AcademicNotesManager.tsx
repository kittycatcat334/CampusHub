import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { AcademicNote } from '../../types';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Edit3,
  Search,
  Tag,
  BookOpen,
  Calendar,
  Check,
  X,
  Bookmark,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface AcademicNotesManagerProps {
  initialCourseFilter?: string | null;
  compact?: boolean;
}

export const AcademicNotesManager: React.FC<AcademicNotesManagerProps> = ({
  initialCourseFilter = null,
  compact = false
}) => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState<AcademicNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>(initialCourseFilter || 'all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<AcademicNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AcademicNote['category']>('lecture');
  const [courseCode, setCourseCode] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [pinned, setPinned] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadNotes = () => {
    if (currentUser) {
      setNotes(db.getAcademicNotes(currentUser.id));
    }
  };

  useEffect(() => {
    loadNotes();
  }, [currentUser]);

  if (!currentUser) return null;

  const userClasses =
    currentUser.role === 'teacher'
      ? db.getTeacherClasses(currentUser.id)
      : db.getStudentClasses(currentUser.id);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('lecture');
    setCourseCode(selectedCourse !== 'all' ? selectedCourse : userClasses[0]?.code || '');
    setTagInput('');
    setPinned(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: AcademicNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || 'lecture');
    setCourseCode(note.courseCode || '');
    setTagInput(note.tags ? note.tags.join(', ') : '');
    setPinned(note.pinned || false);
    setIsModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingNote) {
      db.updateAcademicNote(editingNote.id, {
        title: title.trim(),
        content: content.trim(),
        category,
        courseCode: courseCode.trim().toUpperCase() || undefined,
        tags,
        pinned
      });
    } else {
      db.createAcademicNote({
        userId: currentUser.id,
        userRole: currentUser.role === 'teacher' ? 'teacher' : 'student',
        title: title.trim(),
        content: content.trim(),
        category,
        courseCode: courseCode.trim().toUpperCase() || undefined,
        tags,
        pinned
      });
    }

    loadNotes();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    db.deleteAcademicNote(id);
    loadNotes();
    setDeleteConfirmId(null);
  };

  const handleTogglePin = (note: AcademicNote) => {
    db.updateAcademicNote(note.id, { pinned: !note.pinned });
    loadNotes();
  };

  // Filter notes
  const filteredNotes = notes.filter(n => {
    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    if (selectedCourse !== 'all' && n.courseCode !== selectedCourse) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchCourse = n.courseCode?.toLowerCase().includes(q);
      const matchTag = n.tags?.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchContent || matchCourse || matchTag;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 font-['Space_Grotesk']">
                {currentUser.role === 'teacher' ? 'Faculty Notes & Lesson Plans' : 'Personal Academic Notes & Data'}
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser.role === 'teacher'
                  ? 'Store syllabus ideas, exam problem drafts, and meeting minutes'
                  : 'Manage study notes, cheat sheets, formulas, and assignment checklists'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Academic Note</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes, formulas, tags..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Course filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Courses</option>
            {userClasses.map(c => (
              <option key={c.id} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="lecture">Lecture Takeaways</option>
            <option value="study-plan">Study Plans & Formulas</option>
            <option value="exam-prep">Exam Prep</option>
            <option value="faculty-meeting">Meetings / Governance</option>
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No notes found</p>
          <p className="text-xs text-slate-500 mt-1">
            Create your first academic note to keep formulas, checklists, and lecture summaries organized.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className={`p-4 rounded-xl border bg-white shadow-xs transition-all relative flex flex-col justify-between ${
                note.pinned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Note Top Bar */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {note.courseCode && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {note.courseCode}
                      </span>
                    )}
                    {note.category && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 capitalize">
                        {note.category.replace('-', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(note)}
                      title={note.pinned ? 'Unpin' : 'Pin to top'}
                      className={`p-1 rounded-md transition-colors ${
                        note.pinned
                          ? 'text-amber-600 bg-amber-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(note)}
                      title="Edit note"
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(note.id)}
                      title="Delete note"
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Title */}
                <h3 className="text-sm font-black text-slate-900 mb-1.5 font-['Space_Grotesk']">
                  {note.title}
                </h3>

                {/* Note Content */}
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed mb-3">
                  {note.content}
                </p>
              </div>

              {/* Tags and Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1 flex-wrap">
                  {note.tags &&
                    note.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Delete confirmation overlay */}
              {deleteConfirmId === note.id && (
                <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center p-4 z-10 animate-in fade-in">
                  <div className="text-center space-y-2">
                    <p className="text-xs font-bold text-slate-800">Delete this note?</p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold hover:bg-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Note Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 font-['Space_Grotesk']">
                  {editingNote ? 'Edit Academic Note' : 'Create Academic Note'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Dijkstra Algorithm Step-by-Step Proof or Midterm Topics"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Course Tag
                  </label>
                  <select
                    value={courseCode}
                    onChange={e => setCourseCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value="">General / None</option>
                    {userClasses.map(c => (
                      <option key={c.id} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value="lecture">Lecture Takeaways</option>
                    <option value="study-plan">Study Plan / Formulas</option>
                    <option value="exam-prep">Exam Prep</option>
                    <option value="faculty-meeting">Faculty Meeting</option>
                    <option value="research">Research</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Content / Formula / Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your notes, theorems, reminders, or bullet points here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="Algorithms, Exam Prep, Trees"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="note-pinned"
                  checked={pinned}
                  onChange={e => setPinned(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="note-pinned" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Pin to top of notes
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
