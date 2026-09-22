import React, { useState } from 'react';
import {
  Building2,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Globe,
  MapPin,
  KeyRound,
  Mail,
  User,
  Palette,
  BadgePercent,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Institution, User as UserType } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AddInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newInst: Institution, adminUser: UserType) => void;
}

export const AddInstitutionModal: React.FC<AddInstitutionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createInstitution, switchInstitution } = useAuth();

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [code, setCode] = useState('');
  const [domain, setDomain] = useState('');
  const [tagline, setTagline] = useState('Pioneering Academic Excellence, Applied Innovation & Leadership');
  const [location, setLocation] = useState('');
  const [brandColor, setBrandColor] = useState<'indigo' | 'emerald' | 'purple' | 'rose' | 'amber' | 'sky' | 'blue'>('indigo');
  const [licenseTier, setLicenseTier] = useState<'Starter Campus' | 'Professional Multi-School' | 'Enterprise Global'>('Professional Multi-School');
  
  // Administrator Setup
  const [contactAdminName, setContactAdminName] = useState('');
  const [contactAdminEmail, setContactAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('admin');
  
  // Faculty Verification Code
  const [customSvCode, setCustomSvCode] = useState('');
  
  // Starter Package
  const [seedStarterPackage, setSeedStarterPackage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Auto-fill suggested code and domain as name changes if empty
  const handleNameChange = (val: string) => {
    setName(val);
    const words = val.trim().split(/\s+/);
    if (!shortName) {
      if (words.length > 2) {
        setShortName(words.slice(0, 2).join(' '));
      } else {
        setShortName(val);
      }
    }
    if (!code) {
      const acronym = words.map(w => w[0]).join('').toUpperCase().slice(0, 5);
      if (acronym.length >= 2) setCode(acronym);
    }
    if (!domain) {
      const cleanSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanSlug) setDomain(`${cleanSlug.slice(0, 10)}.edu`);
    }
  };

  const handleCodeChange = (val: string) => {
    const clean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
    setCode(clean);
    if (!customSvCode && clean) {
      setCustomSvCode(`SV-${clean}-2026`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the official institution or university name.');
      return;
    }
    if (!code.trim()) {
      setError('Please provide an institution code or abbreviation (e.g., "MIT", "STAN", "OXF").');
      return;
    }
    if (!domain.trim()) {
      setError('Please provide an academic domain (e.g., "university.edu").');
      return;
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const cleanAdminEmail = contactAdminEmail.trim() || `admin@${cleanDomain}`;
    const cleanAdminName = contactAdminName.trim() || `${shortName || name} Campus Administrator`;
    const cleanSvCode = customSvCode.trim().toUpperCase() || `SV-${code.trim().toUpperCase()}-2026`;

    setIsSubmitting(true);

    try {
      const result = createInstitution({
        name: name.trim(),
        shortName: shortName.trim() || name.trim(),
        code: code.trim().toUpperCase(),
        domain: cleanDomain,
        tagline: tagline.trim(),
        location: location.trim() || 'Main University Campus',
        brandColor,
        logoText: code.trim().slice(0, 4).toUpperCase(),
        licenseTier,
        licenseStatus: 'active',
        licenseExpiresAt: '2028-12-31',
        contactAdminName: cleanAdminName,
        contactAdminEmail: cleanAdminEmail,
        staffVerificationCode: cleanSvCode,
        adminPassword: adminPassword.trim() || 'admin',
        portalSubdomain: `${code.toLowerCase()}.campushub.edu`
      });

      // Auto switch to newly created institution
      switchInstitution(result.institution.id);

      if (onSuccess) {
        onSuccess(result.institution, result.adminUser);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to provision institution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorVariants: Record<string, { bg: string; text: string; border: string; preview: string }> = {
    indigo: { bg: 'bg-indigo-600', text: 'text-indigo-400', border: 'border-indigo-500', preview: 'from-indigo-600 to-purple-600' },
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500', preview: 'from-emerald-600 to-teal-600' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500', preview: 'from-purple-600 to-pink-600' },
    rose: { bg: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-500', preview: 'from-rose-600 to-red-600' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-400', border: 'border-amber-500', preview: 'from-amber-600 to-orange-600' },
    sky: { bg: 'bg-sky-600', text: 'text-sky-400', border: 'border-sky-500', preview: 'from-sky-600 to-blue-600' },
    blue: { bg: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-500', preview: 'from-blue-600 to-indigo-600' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorVariants[brandColor].preview} flex items-center justify-center font-black text-white text-xl shadow-lg shrink-0 font-['Space_Grotesk']`}>
              {code ? code.slice(0, 3) : 'UNI'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Client Provisioning & Licensing
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Sell
                </span>
              </div>
              <h2 className="text-xl font-black font-['Space_Grotesk'] mt-1 text-white">
                Provision New University / Institution
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Create an isolated academic instance for selling this platform to a new university, college, or school.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Institution Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. University Brand & Domain Identity
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Institutional Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Vanguard Institute of Science & Technology"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Short Brand Name / Display
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. Vanguard Tech"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Institution Code / Acronym *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="e.g. VIST"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Domain *
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. vanguard.edu"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Campus City / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Boston, Massachusetts"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motto or Institutional Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Transforming Knowledge into Global Impact"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Theme Color Selection */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Institutional Theme Accent Color</span>
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {(['indigo', 'emerald', 'purple', 'rose', 'amber', 'sky', 'blue'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBrandColor(c)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                        brandColor === c
                          ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${colorVariants[c].bg}`} />
                      <span>{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Commercial License Plan */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Commercial License & Sales Tier
                </h3>
              </div>
              <span className="text-[11px] text-emerald-600 font-bold">Client Tier</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'Starter Campus',
                  title: 'Starter Campus',
                  desc: 'Single department / up to 500 active accounts.',
                  badge: '$999 / mo'
                },
                {
                  id: 'Professional Multi-School',
                  title: 'Pro Academic',
                  desc: 'Multi-school, unlimited courses & custom rooms.',
                  badge: '$2,499 / mo',
                  popular: true
                },
                {
                  id: 'Enterprise Global',
                  title: 'Enterprise Global',
                  desc: 'Full white-label, dedicated SLA & multi-campus.',
                  badge: '$5,999 / mo'
                }
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setLicenseTier(tier.id as any)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    licenseTier === tier.id
                      ? 'border-indigo-600 bg-indigo-500/5 dark:bg-indigo-950/30 ring-2 ring-indigo-500/50'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                      Popular
                    </span>
                  )}
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {tier.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {tier.desc}
                  </p>
                  <span className="inline-block mt-2.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {tier.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Primary Administrator Setup */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  3. Dedicated Client Administrator
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Master Institutional Key</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Full Name
                </label>
                <input
                  type="text"
                  value={contactAdminName}
                  onChange={(e) => setContactAdminName(e.target.value)}
                  placeholder={`Dean of Academic Operations`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Login Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={contactAdminEmail}
                    onChange={(e) => setContactAdminEmail(e.target.value)}
                    placeholder={`admin@${domain || 'institution.edu'}`}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Password
                </label>
                <input
                  type="text"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Faculty Verification Code (SV-Code) & Starter Seed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  4. Staff Verification Code & Initial Curriculum
                </h3>
              </div>
              <span className="text-[11px] text-amber-600 font-bold">Faculty SV-Code</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty SV-Code (Staff Verification Code)
                </label>
                <input
                  type="text"
                  value={customSvCode || (code ? `SV-${code.toUpperCase()}-2026` : 'SV-CAMPUS-2026')}
                  onChange={(e) => setCustomSvCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SV-VIST-2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold font-mono uppercase text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Faculty members of this university must provide this code during registration.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="chk-seed-starter"
                  checked={seedStarterPackage}
                  onChange={(e) => setSeedStarterPackage(e.target.checked)}
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="chk-seed-starter" className="cursor-pointer">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                    Seed Turnkey Starter Curriculum & Demo Accounts
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed block mt-0.5">
                    Pre-populates sample classrooms, faculty account (<code>faculty@{domain || 'edu'}</code>), student account (<code>student@{domain || 'edu'}</code>), and welcome announcement so the portal is instantly presentation-ready.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                id="btn-confirm-provision-institution"
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Provisioning Portal...' : 'Provision & Launch University'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
