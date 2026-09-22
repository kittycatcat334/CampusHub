import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { X, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

interface CreateClassModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [section, setSection] = useState('Section 01');
  const [semester, setSemester] = useState('Fall 2026');
  const [schedule, setSchedule] = useState('Mon & Wed 11:00 AM - 12:30 PM');
  const [room, setRoom] = useState('Science Hall 204');
  const [description, setDescription] = useState('');
  const [joinCode, setJoinCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      alert('Please fill in Course Code and Name.');
      return;
    }

    db.createClass({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      section: section.trim(),
      semester: semester.trim(),
      schedule: schedule.trim(),
      room: room.trim(),
      description: description.trim(),
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      teacherEmail: currentUser.email,
      color: 'indigo',
      joinCode: joinCode.trim().toUpperCase()
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
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Create New University Course</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Course Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS410 or MATH210"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Section & Semester
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Section 01"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
                <input
                  type="text"
                  required
                  placeholder="Fall 2026"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Course Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Operating Systems & Cloud Infrastructures"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Class Meeting Schedule
              </label>
              <input
                type="text"
                placeholder="e.g. Tue & Thu 10:00 AM - 11:30 AM"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Classroom / Meeting Location
              </label>
              <input
                type="text"
                placeholder="e.g. Turing Hall 102 or Online"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Course Description & Objectives
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of syllabus, target outcomes, and prerequisites..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 leading-relaxed"
            />
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-purple-950">Student Enrollment Join Code</p>
              <p className="text-purple-700 text-[11px]">Students can enter this code to join your class stream.</p>
            </div>
            <span className="font-mono font-black text-sm px-3 py-1 bg-white rounded-lg border border-purple-300 text-purple-800">
              {joinCode}
            </span>
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Course created successfully!</span>
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
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
