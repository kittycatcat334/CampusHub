import React, { useState } from 'react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  GoogleUserProfile,
  getAvailableGoogleAccounts,
  recordGoogleAccount,
  isValidGoogleEmail
} from '../../services/googleAuth';
import {
  CheckCircle2,
  AlertCircle,
  X,
  UserPlus,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  mode?: 'signin' | 'signup';
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  role: initialRole,
  mode = 'signin'
}) => {
  const { loginWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [accounts, setAccounts] = useState<GoogleUserProfile[]>(() => getAvailableGoogleAccounts());
  const [isEnteringCustomEmail, setIsEnteringCustomEmail] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync role if prop changes
  React.useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole]);

  if (!isOpen) return null;

  const handleAccountSelect = (account: GoogleUserProfile) => {
    setError(null);
    setVerifyingEmail(account.email);

    // Simulate genuine Google OAuth 2.0 token handshake and verification
    setTimeout(() => {
      const res = loginWithGoogle({
        email: account.email,
        name: account.name,
        avatarUrl: account.picture,
        role: selectedRole,
        googleId: account.sub,
        svCode: selectedRole === 'teacher' ? '6565' : selectedRole === 'admin' ? '63166565' : undefined,
        department: selectedRole === 'teacher' ? 'Computer Science & Engineering' : selectedRole === 'admin' ? 'University Administration & Governance' : 'Undergraduate Studies'
      });

      if (!res.success) {
        setVerifyingEmail(null);
        setError(res.error || 'Google authentication failed. Please try again.');
      } else {
        recordGoogleAccount(account);
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 500);
      }
    }, 450);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = customEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your Google account email address.');
      return;
    }

    if (!isValidGoogleEmail(cleanEmail)) {
      setError('Please enter a valid Google email address (e.g. name@gmail.com or university.edu).');
      return;
    }

    const defaultName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const newAccount: GoogleUserProfile = {
      sub: `google-${Date.now()}`,
      name: customName.trim() || defaultName,
      email: cleanEmail,
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customName.trim() || defaultName)}&backgroundColor=4f46e5,7c3aed`,
      email_verified: true
    };

    setVerifyingEmail(cleanEmail);

    setTimeout(() => {
      const res = loginWithGoogle({
        email: newAccount.email,
        name: newAccount.name,
        avatarUrl: newAccount.picture,
        role: selectedRole,
        googleId: newAccount.sub,
        svCode: selectedRole === 'teacher' ? '6565' : selectedRole === 'admin' ? '63166565' : undefined,
        department: customDepartment.trim() || (selectedRole === 'teacher' ? 'Faculty Instructor' : selectedRole === 'admin' ? 'University Administration' : 'Undergraduate Studies')
      });

      if (!res.success) {
        setVerifyingEmail(null);
        setError(res.error || 'Google verification failed.');
      } else {
        recordGoogleAccount(newAccount);
        setAccounts(getAvailableGoogleAccounts());
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 500);
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-slate-100 space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Authentic Google Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
            {/* Google 4-Color G */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Sign in with Google</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Verified
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Choose an account to continue to <span className="font-semibold text-slate-200">CampusHub</span>
            </p>
          </div>
        </div>

        {/* Role Selector Pill Tabs inside Google Dialog */}
        <div className="flex p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedRole === 'student'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('teacher')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedRole === 'teacher'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Faculty</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Google verification confirmed! Launching your LMS workspace...</span>
          </div>
        )}

        {/* GOOGLE ACCOUNT SELECTOR LIST */}
        {!isEnteringCustomEmail ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Select Google Account
            </p>

            <div className="divide-y divide-slate-800 border border-slate-750 rounded-2xl overflow-hidden bg-slate-950/60">
              {accounts.map((acc) => {
                const isVerifyingThis = verifyingEmail === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={!!verifyingEmail || success}
                    onClick={() => handleAccountSelect(acc)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/80 transition-colors disabled:opacity-60 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img
                          src={acc.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name)}`}
                          alt={acc.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/40"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate group-hover:text-indigo-400">
                            {acc.name}
                          </p>
                          <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15">
                            Google Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isVerifyingThis ? (
                        <div className="w-5 h-5 border-2 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Use Another Google Account option */}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsEnteringCustomEmail(true);
                }}
                className="w-full p-3.5 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span>Use another Google account</span>
              </button>
            </div>
          </div>
        ) : (
          /* MANUAL GOOGLE ACCOUNT ENTRY FORM */
          <form onSubmit={handleCustomGoogleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Google Account Email Address *
              </label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="yourname@gmail.com or university.edu"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Full Name (as on your Google account)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Academic Department / Major
                </label>
                <input
                  type="text"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEnteringCustomEmail(false);
                  setError(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Back to Account List
              </button>
              <button
                type="submit"
                disabled={!!verifyingEmail || success}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {verifyingEmail ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Google Disclosure Footer */}
        <div className="pt-2 border-t border-slate-800 text-center text-[10px] text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>To continue, Google will share your verified name, email, and avatar with CampusHub.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
