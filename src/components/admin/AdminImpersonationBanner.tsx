import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, School, KeyRound } from 'lucide-react';

interface AdminImpersonationBannerProps {
  onOpenClassrooms?: () => void;
  onReturnToAdmin?: () => void;
}

export const AdminImpersonationBanner: React.FC<AdminImpersonationBannerProps> = ({
  onOpenClassrooms,
  onReturnToAdmin
}) => {
  const { currentUser, allUsers, switchUser } = useAuth();

  // Find if there is an admin account in DB
  const adminAccount = allUsers.find(u => u.role === 'admin');

  // If currentUser is already an admin, no need to show impersonation banner
  if (currentUser?.role === 'admin') return null;

  return (
    <aside
      aria-label="Administrator and Builder Quick Access Controls"
      className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-2 border-b border-indigo-500/30 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-indigo-500/30 text-indigo-300">
          <ShieldAlert className="w-3.5 h-3.5" />
        </span>
        <span className="text-slate-300">
          Viewing campus as <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.role})
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onOpenClassrooms && (
          <button
            id="btn-banner-open-classrooms"
            type="button"
            onClick={onOpenClassrooms}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/60 hover:bg-indigo-600 text-indigo-200 hover:text-white font-bold transition-all border border-indigo-400/30"
          >
            <School className="w-3.5 h-3.5" />
            <span>Setup Classrooms</span>
          </button>
        )}

        <button
          id="btn-banner-return-admin"
          type="button"
          onClick={() => {
            if (adminAccount) {
              switchUser(adminAccount.id);
            }
            if (onReturnToAdmin) {
              onReturnToAdmin();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Admin Controls</span>
        </button>
      </div>
    </aside>
  );
};
