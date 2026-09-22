import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  X,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_SV_CODE } from '../../services/db';

interface BuilderSVCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCodeToForm?: (code: string) => void;
}

export const BuilderSVCodeModal: React.FC<BuilderSVCodeModalProps> = ({
  isOpen,
  onClose,
  onApplyCodeToForm
}) => {
  const { staffVerificationCode, updateStaffVerificationCode } = useAuth();

  const [inputCode, setInputCode] = useState(staffVerificationCode);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(staffVerificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleaned = inputCode.trim().toUpperCase();

    if (!cleaned) {
      setError('Staff Verification Code cannot be empty.');
      return;
    }

    if (cleaned.length < 3) {
      setError('Staff Verification Code should be at least 3 characters.');
      return;
    }

    const saved = updateStaffVerificationCode(cleaned);
    setInputCode(saved);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePreset = (preset: string) => {
    setInputCode(preset);
    setError(null);
  };

  const generateRandomCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `SV-${randomNum}`;
    setInputCode(code);
  };

  const handleApplyAndClose = () => {
    if (onApplyCodeToForm) {
      onApplyCodeToForm(staffVerificationCode);
    }
    onClose();
  };

  return (
    <div
      id="modal-builder-svcode"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                Builder Setup: SV-Code
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                App Builder Tool
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Staff Verification Code required for teacher logins & faculty instruction
            </p>
          </div>
        </div>

        {/* Builder Notice Box */}
        <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl mb-5 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-200">
              Teacher Security Gatekeeper
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              As the webapp builder, you define the authorized <strong>SV-Code</strong>. Teachers must enter this code when logging in or registering. Students cannot access faculty features (editing schedules, assignments, or posting announcements) without this code.
            </p>
          </div>
        </div>

        {/* Current Active Code Showcase */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-4 mb-5 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Current Active SV-Code
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
              Enforced on Teacher Logins
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-wider select-all break-all">
              {staffVerificationCode}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="btn-copy-svcode"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              {onApplyCodeToForm && (
                <button
                  type="button"
                  id="btn-apply-svcode"
                  onClick={handleApplyAndClose}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <span>Apply & Fill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Change SV-Code Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Configure New Staff Verification Code</span>
              </label>
              <span className="text-[10px] text-slate-400">Builder Customized</span>
            </div>

            <input
              id="input-builder-svcode"
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                setError(null);
                setSaveSuccess(false);
              }}
              placeholder="e.g. SV-TEACH-2026"
              className="w-full text-sm font-mono tracking-wide px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 mb-2">
              Quick Suggestions & Presets:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handlePreset(DEFAULT_SV_CODE)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {DEFAULT_SV_CODE} (Default)
              </button>
              <button
                type="button"
                onClick={() => handlePreset('FACULTY-2026')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                FACULTY-2026
              </button>
              <button
                type="button"
                onClick={() => handlePreset('STAFF-ACCESS-77')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                STAFF-ACCESS-77
              </button>
              <button
                type="button"
                onClick={generateRandomCode}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Random Code</span>
              </button>
            </div>
          </div>

          {/* Success / Error Feedback */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {saveSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>SV-Code updated successfully! Faculty must now use this code to sign in.</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Done
            </button>

            <button
              id="btn-save-builder-svcode"
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Save & Activate SV-Code</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
