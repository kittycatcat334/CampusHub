import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { UniversityClass } from '../../types';
import {
  BookOpen,
  Plus,
  Users,
  Calendar,
  MapPin,
  Clock,
  Copy,
  Check,
  Megaphone,
  FileCheck2,
  FolderArchive,
  Edit3,
  Trash2,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface TeacherClassesProps {
  onOpenCreateClass: () => void;
  onOpenCreateAssignment: (classId: string) => void;
  onOpenPostAnnouncement: (classId: string) => void;
  onOpenUploadResource: (classId: string) => void;
}

export const TeacherClasses: React.FC<TeacherClassesProps> = ({
  onOpenCreateClass,
  onOpenCreateAssignment,
  onOpenPostAnnouncement,
  onOpenUploadResource
}) => {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState<UniversityClass[]>(() =>
    currentUser ? db.getTeacherClasses(currentUser.id) : []
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Edit / Modify Class Schedule & Details Modal State
  const [editingClass, setEditingClass] = useState<UniversityClass | null>(null);
  const [editForm, setEditForm] = useState({
    code: '',
    name: '',
    section: '',
    semester: '',
    room: '',
    schedule: '',
    description: ''
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const refreshClasses = () => {
    if (currentUser) {
      setClasses(db.getTeacherClasses(currentUser.id));
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenEdit = (cls: UniversityClass) => {
    setEditingClass(cls);
    setEditForm({
      code: cls.code,
      name: cls.name,
      section: cls.section,
      semester: cls.semester,
      room: cls.room,
      schedule: cls.schedule,
      description: cls.description || ''
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    db.updateClass(editingClass.id, {
      code: editForm.code.trim().toUpperCase(),
      name: editForm.name.trim(),
      section: editForm.section.trim(),
      semester: editForm.semester.trim(),
      room: editForm.room.trim(),
      schedule: editForm.schedule.trim(),
      description: editForm.description.trim()
    });

    setEditingClass(null);
    refreshClasses();
  };

  const handleDeleteClass = (classId: string) => {
    db.deleteClass(classId);
    setDeleteConfirmId(null);
    setEditingClass(null);
    refreshClasses();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Course Management & Rosters
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              {classes.length} Active {classes.length === 1 ? 'Course' : 'Courses'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create subjects, modify class schedules, edit lecture halls, generate student join codes, and manage courses.
          </p>
        </div>

        <button
          onClick={onOpenCreateClass}
          className="inline-flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-purple-200 transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No active courses yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Get started by creating your first course. CampusHub will generate a unique join code for students.
          </p>
          <button
            onClick={onOpenCreateClass}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Course
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls) => {
            const assignments = db.getAssignments(cls.id);
            const announcements = db.getAnnouncements(cls.id);
            const resources = db.getResources(cls.id);

            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded bg-purple-100 text-purple-800">
                        {cls.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {cls.section} &bull; {cls.semester}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{cls.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{cls.description}</p>
                  </div>

                  {/* Actions & Join Code Box */}
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <div className="text-left">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Join Code</p>
                        <p className="font-mono font-black text-xs sm:text-sm text-purple-700">{cls.joinCode}</p>
                      </div>
                      <button
                        onClick={() => handleCopyCode(cls.joinCode)}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                        title="Copy Join Code to Clipboard"
                      >
                        {copiedCode === cls.joinCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* MODIFY SCHEDULE & DETAILS BUTTON */}
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 text-purple-700 hover:border-purple-300 text-xs font-bold transition-all shadow-2xs"
                      title="Modify Class Schedule & Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modify Schedule</span>
                    </button>
                  </div>
                </div>

                {/* Info row with Schedule, Room, and Enrolled Count */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Schedule</span>
                      <span className="font-medium text-slate-800">{cls.schedule}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Room / Lecture Hall</span>
                      <span className="font-medium text-slate-800">{cls.room}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Enrollment</span>
                      <span className="font-medium text-slate-800">{cls.enrolledStudentCount || 25} Enrolled Students</span>
                    </div>
                  </div>
                </div>

                {/* Quick actions for this course */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400">
                    {assignments.length} assignments &bull; {announcements.length} announcements &bull; {resources.length} resources
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onOpenCreateAssignment(cls.id)}
                      className="inline-flex items-center gap-1 font-semibold px-2.5 py-1.5 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      + Assignment
                    </button>
                    <button
                      onClick={() => onOpenPostAnnouncement(cls.id)}
                      className="inline-flex items-center gap-1 font-semibold px-2.5 py-1.5 rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      + Announcement
                    </button>
                    <button
                      onClick={() => onOpenUploadResource(cls.id)}
                      className="inline-flex items-center gap-1 font-semibold px-2.5 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    >
                      <FolderArchive className="w-3.5 h-3.5" />
                      + Resource
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODIFY CLASS SCHEDULE & DETAILS MODAL */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Modify Class Schedule & Details</h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Update timetable, classroom room number, and course info for {editingClass.code}
                </p>
              </div>
              <button
                onClick={() => setEditingClass(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={editForm.code}
                    onChange={e => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={editForm.section}
                    onChange={e => setEditForm(prev => ({ ...prev, section: e.target.value }))}
                    placeholder="Sec 01"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600"
                />
              </div>

              {/* SCHEDULE (KEY REQUIREMENT) */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-700" />
                    Lecture Schedule (Timetable)
                  </label>
                  <span className="text-[10px] text-purple-600 font-medium">Students see this in Real-Time</span>
                </div>
                <input
                  type="text"
                  required
                  value={editForm.schedule}
                  onChange={e => setEditForm(prev => ({ ...prev, schedule: e.target.value }))}
                  placeholder="e.g. Mon & Wed 10:00 AM - 11:30 AM"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 font-medium text-slate-800"
                />
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-500 mr-1 self-center">Quick Presets:</span>
                  {[
                    'Mon & Wed 10:00 AM - 11:30 AM',
                    'Tue & Thu 1:00 PM - 2:30 PM',
                    'Mon, Wed & Fri 9:00 AM - 10:00 AM',
                    'Tue & Thu 11:00 AM - 12:30 PM',
                    'Friday 2:00 PM - 5:00 PM'
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, schedule: preset }))}
                      className="text-[10px] px-2 py-0.5 rounded bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Room / Lecture Hall</label>
                  <input
                    type="text"
                    required
                    value={editForm.room}
                    onChange={e => setEditForm(prev => ({ ...prev, room: e.target.value }))}
                    placeholder="e.g. Turing Hall 304"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Semester</label>
                  <input
                    type="text"
                    required
                    value={editForm.semester}
                    onChange={e => setEditForm(prev => ({ ...prev, semester: e.target.value }))}
                    placeholder="Fall 2026"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Course Description / Syllabus Overview</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-purple-600"
                />
              </div>

              {/* Danger Zone: Delete Class */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {deleteConfirmId === editingClass.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-600 font-bold">Confirm delete course?</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteClass(editingClass.id)}
                      className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
                    >
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(editingClass.id)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Course</span>
                  </button>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
