import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { X, KeyRound, CheckCircle2, AlertCircle, Sparkles, BookOpen, Plus, Check } from 'lucide-react';

interface JoinClassModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const JoinClassModal: React.FC<JoinClassModalProps> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const allClasses = db.getClasses();
  const enrolledClasses = currentUser ? db.getStudentClasses(currentUser.id) : [];
  const enrolledIds = new Set(enrolledClasses.map(c => c.id));

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!joinCode.trim()) {
      setError('Please enter a course join code.');
      return;
    }

    const res = db.joinClassByCode(joinCode, currentUser.id);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccess(res.message);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    }
  };

  const handleDirectEnroll = (classId: string) => {
    setError('');
    setSuccess('');
    const cls = db.getClassById(classId);
    if (!cls) return;

    db.enrollStudent(classId, currentUser.id);
    setSuccess(`Successfully enrolled in ${cls.code} - ${cls.name}!`);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Enroll in University Course</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Method 1: Enter Join Code */}
          <form onSubmit={handleJoin} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Join with Course Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={10}
                placeholder="Enter 6-char code (e.g. CS201A)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="flex-1 uppercase tracking-wider font-mono font-bold text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 shrink-0 cursor-pointer"
              >
                Join by Code
              </button>
            </div>
          </form>

          {/* Method 2: Browse Available Courses on Campus */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Or Browse Campus Courses ({allClasses.length})
              </span>
              <span className="text-[11px] text-slate-400">1-Click Instant Enrollment</span>
            </div>

            {allClasses.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">No courses available on campus yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Ask your faculty instructor to create the course first.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {allClasses.map((cls) => {
                  const isEnrolled = enrolledIds.has(cls.id);
                  return (
                    <div
                      key={cls.id}
                      className="p-3 rounded-xl border border-slate-200 hover:border-indigo-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px]">
                            {cls.code}
                          </span>
                          <h4 className="font-bold text-slate-900 truncate">{cls.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {cls.teacherName} &bull; {cls.schedule} &bull; Code: <span className="font-mono font-semibold">{cls.joinCode}</span>
                        </p>
                      </div>

                      {isEnrolled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                          <Check className="w-3 h-3" />
                          Enrolled
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDirectEnroll(cls.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Enroll</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
