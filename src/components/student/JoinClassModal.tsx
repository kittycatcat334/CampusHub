import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { X, KeyRound, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface JoinClassModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const JoinClassModal: React.FC<JoinClassModalProps> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Join a Course</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Ask your professor or TA for the 6-character course code, then enter it below to access syllabus, assignments, and class announcements.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Course Code
            </label>
            <input
              type="text"
              required
              maxLength={10}
              placeholder="e.g. CS201A or MATH52"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full uppercase text-center tracking-widest text-lg font-mono font-bold px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Try demo course join codes:
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-mono font-bold text-indigo-600">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">CS201A</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">MATH52</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">CS340X</span>
            </div>
          </div>

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

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              Enroll in Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
