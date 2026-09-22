import React, { useState } from 'react';
import {
  Building2,
  X,
  Copy,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  KeyRound,
  Mail,
  Lock,
  Globe,
  Award,
  Layers,
  FileText,
  UserCheck,
  Download
} from 'lucide-react';
import { Institution, User as UserType } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface InstitutionHandoverModalProps {
  institution: Institution | null;
  adminUser?: UserType;
  isOpen: boolean;
  onClose: () => void;
  onSwitchToInstitution?: (instId: string) => void;
}

export const InstitutionHandoverModal: React.FC<InstitutionHandoverModalProps> = ({
  institution,
  adminUser,
  isOpen,
  onClose,
  onSwitchToInstitution
}) => {
  const { allUsers, switchInstitution, switchUser } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !institution) return null;

  const instUsers = allUsers.filter(u => u.institutionId === institution.id);
  const foundAdmin = adminUser || instUsers.find(u => u.role === 'admin') || {
    id: `admin-${institution.id}`,
    name: institution.contactAdminName,
    email: institution.contactAdminEmail,
    password: 'admin',
    role: 'admin' as const
  };
  const foundTeacher = instUsers.find(u => u.role === 'teacher') || {
    id: `teacher-${institution.id}`,
    name: 'Prof. Academic Lead',
    email: `faculty@${institution.domain}`,
    password: 'faculty123',
    role: 'teacher' as const
  };
  const foundStudent = instUsers.find(u => u.role === 'student') || {
    id: `student-${institution.id}`,
    name: 'Jordan Student',
    email: `student@${institution.domain}`,
    password: 'student123',
    role: 'student' as const
  };

  const portalUrl = `${window.location.origin}?institution=${institution.code.toLowerCase()}`;

  const handoverText = `
=====================================================
OFFICIAL CLIENT HANDOVER DOSSIER - ACADEMIC CLOUD
=====================================================
Institution:        ${institution.name} (${institution.code})
Academic Domain:    ${institution.domain}
Location:           ${institution.location}
License Tier:       ${institution.licenseTier} (Active until ${institution.licenseExpiresAt})
Portal URL:         ${portalUrl}

-----------------------------------------------------
1. MASTER INSTITUTION ADMINISTRATOR ACCOUNT
-----------------------------------------------------
Contact / Dean:     ${foundAdmin.name}
Login Email:        ${foundAdmin.email}
Default Password:   ${foundAdmin.password || 'admin'}
Authority Level:    Full System Oversight & Classroom Provisioning

-----------------------------------------------------
2. FACULTY VERIFICATION CODE (STAFF VERIFICATION)
-----------------------------------------------------
Staff Code (SV):    ${institution.staffVerificationCode}
Notes:              Provide this SV-Code strictly to verified university faculty. 
                    It authorizes instructors to schedule lecture halls and create courses.

-----------------------------------------------------
3. PRE-CONFIGURED DEMO & VERIFICATION ACCOUNTS
-----------------------------------------------------
Faculty Demo:       ${foundTeacher.email}  |  Pass: ${foundTeacher.password || 'faculty123'}
Student Demo:       ${foundStudent.email}  |  Pass: ${foundStudent.password || 'student123'}

-----------------------------------------------------
4. ONBOARDING & SETUP INSTRUCTIONS FOR IT DEPARTMENT
-----------------------------------------------------
Step 1: Access the portal link above.
Step 2: Sign in with the Master Administrator credentials.
Step 3: Open "Academic Operations Command Center" -> "Classroom Setup & Rooms".
Step 4: Configure lecture halls, smart labs, and weekly timetables.
Step 5: Distribute the Faculty Verification Code (${institution.staffVerificationCode}) to teaching staff.
=====================================================
CampusHub Multi-Tenant Academic OS - Enterprise Platform
=====================================================
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(handoverText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLaunchAndLogin = () => {
    switchInstitution(institution.id);
    if (foundAdmin.id) {
      switchUser(foundAdmin.id);
    }
    if (onSwitchToInstitution) {
      onSwitchToInstitution(institution.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xl shrink-0 font-['Space_Grotesk']">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Client Handover Dossier
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {institution.licenseTier}
                </span>
              </div>
              <h2 className="text-xl font-black font-['Space_Grotesk'] mt-1 text-white">
                {institution.name} Credentials Pack
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready-to-deliver commercial onboarding documentation for this university client.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Key Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Master Admin Card */}
            <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Institution Admin Account</span>
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">{foundAdmin.name}</p>
                <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{foundAdmin.email}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pass: <strong>{foundAdmin.password || 'admin'}</strong></span>
                </div>
              </div>
            </div>

            {/* Faculty SV-Code Card */}
            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <KeyRound className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Faculty Verification Code</span>
              </div>
              <div>
                <p className="text-lg font-black font-mono text-amber-700 dark:text-amber-300 tracking-wider">
                  {institution.staffVerificationCode}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Provide to university teachers to register and manage classrooms.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Details Table */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Institution Code & Domain:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {institution.code} &bull; {institution.domain}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Demo Faculty Account:</span>
              <span className="font-medium text-slate-900 dark:text-white font-mono">
                {foundTeacher.email} (pass: {foundTeacher.password || 'faculty123'})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Demo Student Account:</span>
              <span className="font-medium text-slate-900 dark:text-white font-mono">
                {foundStudent.email} (pass: {foundStudent.password || 'student123'})
              </span>
            </div>
          </div>

          {/* Formatted Dossier Textbox for Quick Copying */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Complete Client Welcome Packet (Plain Text)</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Entire Dossier'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={9}
              value={handoverText}
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-mono text-xs leading-relaxed focus:outline-none select-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            Close Dossier
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Dossier Copied' : 'Copy Package'}</span>
            </button>

            <button
              type="button"
              onClick={handleLaunchAndLogin}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Switch & Login to this Campus</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
