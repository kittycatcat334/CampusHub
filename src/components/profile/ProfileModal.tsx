import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { X, User, Mail, GraduationCap, Building, ShieldCheck, CheckCircle2, RotateCcw, LogOut } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { currentUser, switchUser, logout } = useAuth();
  const allUsers = db.getUsers();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [saved, setSaved] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateUserProfile(currentUser.id, { name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo courses, assignments, and submissions to default state?')) {
      db.resetData();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">User Profile & Account</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* Avatar and Role */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                  currentUser.role === 'teacher'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {currentUser.role}
                </span>
                <span className="text-slate-500">
                  {currentUser.department || currentUser.title || 'Academic Department'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Switch Profiles */}
          <div className="space-y-2">
            <label className="block font-bold uppercase tracking-wider text-slate-500">
              Switch Pre-Configured Campus Account
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    u.id === currentUser.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{u.role} &bull; {u.department || u.title || 'Faculty'}</p>
                  </div>
                  {u.id === currentUser.id && (
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Edit Information</h4>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-600">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-600">University Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-semibold"
              />
            </div>

            {saved && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Account details saved!</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                id="btn-profile-logout"
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 font-bold rounded-xl flex items-center gap-1.5 transition-colors text-xs cursor-pointer"
                title="Sign out of CampusHub"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Sign Out</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Danger zone / Reset Demo State */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Reset Workspace Data</p>
              <p className="text-[11px] text-slate-400">Restore factory sample courses and submissions</p>
            </div>
            <button
              onClick={handleResetData}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
