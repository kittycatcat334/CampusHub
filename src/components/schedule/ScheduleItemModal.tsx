import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { PersonalScheduleItem } from '../../types';
import {
  X,
  Clock,
  MapPin,
  BookOpen,
  Calendar,
  Sparkles,
  CheckCircle2,
  Tag
} from 'lucide-react';

interface ScheduleItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  itemToEdit?: PersonalScheduleItem | null;
  defaultDay?: string;
}

const CATEGORIES = [
  { id: 'study-session', label: 'Study Session / Group Study', color: 'indigo' },
  { id: 'office-hours', label: 'Office Hours (Teaching / Visit)', color: 'amber' },
  { id: 'review', label: 'Exam Review / Problem Session', color: 'emerald' },
  { id: 'lab', label: 'Lab Work / Practical Prep', color: 'sky' },
  { id: 'lecture', label: 'Supplementary Lecture', color: 'purple' },
  { id: 'personal', label: 'Personal Academic Block', color: 'rose' }
] as const;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const TIME_OPTIONS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
];

export const ScheduleItemModal: React.FC<ScheduleItemModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  itemToEdit,
  defaultDay = 'Thursday'
}) => {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PersonalScheduleItem['category']>('study-session');
  const [dayOfWeek, setDayOfWeek] = useState<PersonalScheduleItem['dayOfWeek']>('Thursday');
  const [startTime, setStartTime] = useState('02:00 PM');
  const [endTime, setEndTime] = useState('03:30 PM');
  const [location, setLocation] = useState('');
  const [courseId, setCourseId] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('indigo');
  const [error, setError] = useState<string | null>(null);

  // User courses for dropdown
  const userClasses = currentUser
    ? currentUser.role === 'teacher'
      ? db.getTeacherClasses(currentUser.id)
      : db.getStudentClasses(currentUser.id)
    : [];

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setCategory(itemToEdit.category);
      setDayOfWeek(itemToEdit.dayOfWeek);
      setStartTime(itemToEdit.startTime);
      setEndTime(itemToEdit.endTime);
      setLocation(itemToEdit.location || '');
      setCourseId(itemToEdit.courseId || '');
      setDescription(itemToEdit.description || '');
      setColor(itemToEdit.color || 'indigo');
    } else {
      setTitle('');
      setCategory(currentUser?.role === 'teacher' ? 'office-hours' : 'study-session');
      setDayOfWeek((defaultDay as any) || 'Thursday');
      setStartTime('02:00 PM');
      setEndTime('03:30 PM');
      setLocation('');
      setCourseId('');
      setDescription('');
      setColor(currentUser?.role === 'teacher' ? 'purple' : 'indigo');
    }
    setError(null);
  }, [itemToEdit, defaultDay, isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter an event or session title.');
      return;
    }

    const matchedCourse = userClasses.find(c => c.id === courseId);

    const payload = {
      userId: currentUser.id,
      userRole: (currentUser.role === 'teacher' ? 'teacher' : 'student') as 'student' | 'teacher',
      title: title.trim(),
      category,
      dayOfWeek,
      startTime,
      endTime,
      location: location.trim(),
      courseId: matchedCourse?.id,
      courseCode: matchedCourse?.code,
      courseName: matchedCourse?.name,
      description: description.trim(),
      completed: itemToEdit ? itemToEdit.completed : false,
      color
    };

    if (itemToEdit) {
      db.updatePersonalScheduleItem(itemToEdit.id, payload);
    } else {
      db.createPersonalScheduleItem(payload);
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 font-['Space_Grotesk']">
                {itemToEdit ? 'Edit Schedule Commitment' : 'Add to Schedule'}
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser.role === 'teacher'
                  ? 'Manage your office hours, review sessions, or teaching blocks'
                  : 'Add study sessions, review blocks, or personal academic plans'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Title / Activity Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={
                currentUser.role === 'teacher'
                  ? 'e.g., Weekly Drop-In Office Hours or Midterm Review'
                  : 'e.g., CS201 Binary Trees Study Session or Lab Prep'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
            />
          </div>

          {/* Category & Day of Week Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={e => {
                  const cat = e.target.value as PersonalScheduleItem['category'];
                  setCategory(cat);
                  const matched = CATEGORIES.find(c => c.id === cat);
                  if (matched) setColor(matched.color);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
              >
                {DAYS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Time & End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
              >
                {TIME_OPTIONS.map(t => (
                  <option key={`start-${t}`} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <select
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
              >
                {TIME_OPTIONS.map(t => (
                  <option key={`end-${t}`} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Associated Course & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Linked Course (Optional)
              </label>
              <select
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
              >
                <option value="">None / General Academic</option>
                {userClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.code} - {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location / Room / Link
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g., Library Room 4, Hopper 312, or Zoom"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          {/* Description / Objectives */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes / Agendas
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What to accomplish or focus on during this block..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
            />
          </div>

          {/* Color Accent Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Badge Color Accent
            </label>
            <div className="flex items-center gap-2">
              {[
                { name: 'indigo', bg: 'bg-indigo-600' },
                { name: 'emerald', bg: 'bg-emerald-600' },
                { name: 'purple', bg: 'bg-purple-600' },
                { name: 'amber', bg: 'bg-amber-600' },
                { name: 'rose', bg: 'bg-rose-600' },
                { name: 'sky', bg: 'bg-sky-600' }
              ].map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={`w-6 h-6 rounded-full ${c.bg} transition-transform ${
                    color === c.name ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{itemToEdit ? 'Save Changes' : 'Add to Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
