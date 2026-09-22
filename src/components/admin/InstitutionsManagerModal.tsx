import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Institution } from '../../types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Globe,
  Sparkles,
  Search,
  Key,
  Calendar,
  X,
  CreditCard,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface InstitutionsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstitutionsManagerModal: React.FC<InstitutionsManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    institutions,
    currentInstitution,
    switchInstitution,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    allUsers,
    loginAsUser
  } = useAuth();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Institution Form Fields
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [code, setCode] = useState('');
  const [domain, setDomain] = useState('');
  const [tagline, setTagline] = useState('');
  const [location, setLocation] = useState('');
  const [brandColor, setBrandColor] = useState<Institution['brandColor']>('indigo');
  const [logoText, setLogoText] = useState('');
  const [licenseTier, setLicenseTier] = useState<Institution['licenseTier']>('Enterprise Global');
  const [licenseStatus, setLicenseStatus] = useState<Institution['licenseStatus']>('active');
  const [licenseExpiresAt, setLicenseExpiresAt] = useState('2028-12-31');
  const [contactAdminName, setContactAdminName] = useState('');
  const [contactAdminEmail, setContactAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [staffVerificationCode, setStaffVerificationCode] = useState('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`Copied ${text} to clipboard`);
  };

  const resetForm = () => {
    setName('');
    setShortName('');
    setCode('');
    setDomain('');
    setTagline('');
    setLocation('');
    setBrandColor('indigo');
    setLogoText('');
    setLicenseTier('Enterprise Global');
    setLicenseStatus('active');
    setLicenseExpiresAt('2028-12-31');
    setContactAdminName('');
    setContactAdminEmail('');
    setAdminPassword('admin123');
    setStaffVerificationCode('');
    setEditingInst(null);
  };

  const handleOpenEdit = (inst: Institution) => {
    setEditingInst(inst);
    setName(inst.name);
    setShortName(inst.shortName);
    setCode(inst.code);
    setDomain(inst.domain);
    setTagline(inst.tagline);
    setLocation(inst.location);
    setBrandColor(inst.brandColor);
    setLogoText(inst.logoText);
    setLicenseTier(inst.licenseTier);
    setLicenseStatus(inst.licenseStatus);
    setLicenseExpiresAt(inst.licenseExpiresAt);
    setContactAdminName(inst.contactAdminName);
    setContactAdminEmail(inst.contactAdminEmail);
    setStaffVerificationCode(inst.staffVerificationCode);
    setIsCreateOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !domain.trim()) {
      alert('Please fill out the institution name, short code, and domain.');
      return;
    }

    if (editingInst) {
      updateInstitution(editingInst.id, {
        name: name.trim(),
        shortName: shortName.trim() || name.trim(),
        code: code.trim().toUpperCase(),
        domain: domain.trim().toLowerCase(),
        tagline: tagline.trim(),
        location: location.trim(),
        brandColor,
        logoText: logoText.trim() || code.trim().slice(0, 4),
        licenseTier,
        licenseStatus,
        licenseExpiresAt,
        contactAdminName: contactAdminName.trim(),
        contactAdminEmail: contactAdminEmail.trim().toLowerCase(),
        staffVerificationCode: staffVerificationCode.trim().toUpperCase()
      });
      showToast(`Updated ${name} successfully!`);
    } else {
      const result = createInstitution({
        name: name.trim(),
        shortName: shortName.trim() || name.trim(),
        code: code.trim().toUpperCase(),
        domain: domain.trim().toLowerCase(),
        tagline: tagline.trim() || 'Premier Academic & Technological Institution',
        location: location.trim() || 'Global Campus',
        brandColor,
        logoText: logoText.trim() || code.trim().slice(0, 4),
        licenseTier,
        licenseStatus,
        licenseExpiresAt,
        contactAdminName: contactAdminName.trim() || `${shortName || code} Administrator`,
        contactAdminEmail: contactAdminEmail.trim().toLowerCase() || `admin@${domain.trim().toLowerCase()}`,
        adminPassword: adminPassword.trim() || 'admin123',
        staffVerificationCode: staffVerificationCode.trim().toUpperCase() || `SV-${code.trim().toUpperCase()}-2026`,
        portalSubdomain: `${code.trim().toLowerCase()}.campushub.edu`
      });
      showToast(`Provisioned new institution: ${result.institution.name}! Admin account created: ${result.adminUser.email}`);
    }

    setIsCreateOpen(false);
    resetForm();
  };

  const handleDelete = (inst: Institution) => {
    if (institutions.length <= 1) {
      alert('You cannot delete the only remaining institution.');
      return;
    }
    if (confirm(`Are you sure you want to decommission and remove "${inst.name}"? This removes its dedicated workspace configuration.`)) {
      deleteInstitution(inst.id);
      showToast(`Decommissioned ${inst.name}.`);
    }
  };

  const handleImpersonateAdmin = (inst: Institution) => {
    // Switch institution first
    switchInstitution(inst.id);
    // Find admin user for this institution
    const adminUser = allUsers.find(u => u.role === 'admin' && (u.institutionId === inst.id || u.email === inst.contactAdminEmail));
    if (adminUser) {
      loginAsUser(adminUser);
      showToast(`Switched active institution to ${inst.name} and logged in as ${adminUser.name}`);
    } else {
      showToast(`Switched active institution to ${inst.name}`);
    }
    onClose();
  };

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.code.toLowerCase().includes(search.toLowerCase()) ||
    inst.domain.toLowerCase().includes(search.toLowerCase()) ||
    inst.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Multi-Tenant University Provisioning & Sales</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Commercial SaaS Suite
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Onboard new client universities or institutions. Each institution receives independent portals, classrooms, course catalogs, and faculty keys.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white px-6 py-2 text-xs font-semibold flex items-center gap-2 shadow-xs shrink-0 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50 dark:bg-slate-950/30">
          {/* Top Bar: Summary + Add New Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search client universities..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                {filteredInstitutions.length} {filteredInstitutions.length === 1 ? 'Campus' : 'Campuses'} Registered
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                id="btn-provision-new-institution"
                onClick={() => {
                  resetForm();
                  setIsCreateOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs shadow-indigo-900/20 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New University / Client</span>
              </button>
            </div>
          </div>

          {/* Form Modal / Accordion for Adding/Editing */}
          {isCreateOpen && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-indigo-500/40 p-5 shadow-xl animate-in slide-in-from-top duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingInst ? `Edit Institution Profile: ${editingInst.name}` : 'Provision & Deploy New Client University / Institution'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetForm();
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Institution / University Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Oxford Metropolitan University"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Short Display Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Short Name / Brand *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Oxford Metro"
                      value={shortName}
                      onChange={e => setShortName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* University Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      University Code (Prefix) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OMU"
                      value={code}
                      onChange={e => setCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* University Domain */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email & Portal Domain *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. oxfordmetro.edu"
                      value={domain}
                      onChange={e => setDomain(e.target.value.toLowerCase())}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono lowercase focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Geographic Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Headquarters / City, Country
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. London, United Kingdom"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Commercial License Tier */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subscription / License Tier (Selling Plan)
                    </label>
                    <select
                      value={licenseTier}
                      onChange={e => setLicenseTier(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Starter Campus">Starter Campus (Up to 500 Students)</option>
                      <option value="Professional Multi-School">Professional Multi-School (5,000 Students)</option>
                      <option value="Enterprise Global">Enterprise Global (Unlimited Campus Access)</option>
                    </select>
                  </div>

                  {/* Brand Color Theme */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      University Identity Theme
                    </label>
                    <select
                      value={brandColor}
                      onChange={e => setBrandColor(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="indigo">Indigo Corporate</option>
                      <option value="emerald">Emerald Innovation</option>
                      <option value="purple">Royal Purple Academic</option>
                      <option value="rose">Crimson Collegiate</option>
                      <option value="blue">Sapphire Tech</option>
                      <option value="amber">Amber Heritage</option>
                    </select>
                  </div>

                  {/* License Expiry */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      License Expiration Date
                    </label>
                    <input
                      type="date"
                      value={licenseExpiresAt}
                      onChange={e => setLicenseExpiresAt(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* University Tagline */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Institution Tagline / Mission Statement
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pioneering Global Leadership, Sciences, and Creative Thought"
                      value={tagline}
                      onChange={e => setTagline(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Dedicated Faculty SV-Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Faculty Staff Verification Key (SV-Code)
                    </label>
                    <input
                      type="text"
                      placeholder={`SV-${code || 'OMU'}-2026`}
                      value={staffVerificationCode}
                      onChange={e => setStaffVerificationCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Given to teachers of this university for secured faculty registration.</p>
                  </div>

                  {/* Initial Admin Contact Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Client Administrator / Dean Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Eleanor Vance"
                      value={contactAdminName}
                      onChange={e => setContactAdminName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Initial Admin Email & Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Administrator Login Email
                    </label>
                    <input
                      type="email"
                      placeholder={`admin@${domain || 'institution.edu'}`}
                      value={contactAdminEmail}
                      onChange={e => setContactAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {!editingInst && (
                  <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                      <p className="font-bold">Automated Client Delivery Pack</p>
                      <p className="text-[11px] text-indigo-800 dark:text-indigo-300">
                        When you provision this institution, CampusHub will automatically generate a Master Admin account (<span className="font-mono font-bold">admin@{domain || 'domain.edu'}</span> with initial password <span className="font-mono font-bold">{adminPassword}</span>) and seed starter physical lecture halls so the client can begin using the system immediately upon delivery.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingInst ? 'Save Changes' : 'Deploy & Provision Institution'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Client Universities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInstitutions.map(inst => {
              const isActive = inst.id === currentInstitution.id;
              return (
                <div
                  key={inst.id}
                  className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-xs ${
                        inst.brandColor === 'emerald' ? 'bg-emerald-600' :
                        inst.brandColor === 'purple' ? 'bg-purple-600' :
                        inst.brandColor === 'rose' ? 'bg-rose-600' :
                        inst.brandColor === 'amber' ? 'bg-amber-600' :
                        inst.brandColor === 'blue' ? 'bg-blue-600' :
                        'bg-indigo-600'
                      }`}>
                        {inst.logoText || inst.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {inst.name}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                              Active Workspace
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{inst.shortName}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.2 rounded text-slate-700 dark:text-slate-300">{inst.code}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400" />
                            {inst.domain}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(inst)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Edit Institution Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(inst)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Decommission Institution"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="my-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <p className="text-[11px] italic text-slate-500 line-clamp-2">
                      "{inst.tagline}"
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">License Tier</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-indigo-500" />
                          {inst.licenseTier}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">License Expiry</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-500" />
                          {inst.licenseExpiresAt}
                        </span>
                      </div>
                    </div>

                    {/* Admin & Faculty Credentials */}
                    <div className="bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] uppercase font-sans font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-indigo-500" />
                          Institution Admin Email:
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{inst.contactAdminEmail}</span>
                          <button
                            onClick={() => copyToClipboard(inst.contactAdminEmail, `email-${inst.id}`)}
                            className="text-slate-400 hover:text-indigo-600 p-0.5"
                          >
                            {copiedId === `email-${inst.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] uppercase font-sans font-semibold flex items-center gap-1">
                          <Key className="w-3 h-3 text-amber-500" />
                          Faculty SV-Code:
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1 rounded">
                            {inst.staffVerificationCode}
                          </span>
                          <button
                            onClick={() => copyToClipboard(inst.staffVerificationCode, `sv-${inst.id}`)}
                            className="text-slate-400 hover:text-indigo-600 p-0.5"
                          >
                            {copiedId === `sv-${inst.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      {inst.location}
                    </span>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Currently Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleImpersonateAdmin(inst)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-all shadow-2xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Switch & Enter Institution
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sales & Multi-Tenancy Commercial Guide */}
          <div className="bg-linear-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-indigo-800/50 shadow-md">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300 shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <span>How to Deliver This Platform to Client Universities & Buyers</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Ready to Sell
                  </span>
                </h4>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  When you sell access to a university or school:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="font-bold block text-white mb-1">1. Provision Institution</span>
                    <span className="text-slate-300 text-[11px]">Click "Onboard New University", enter their official school name, domain, and desired license tier.</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="font-bold block text-white mb-1">2. Hand Over Credentials</span>
                    <span className="text-slate-300 text-[11px]">Give the university client their dedicated Administrator Login Email, initial password, and Faculty SV-Code.</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="font-bold block text-white mb-1">3. Client Starts Immediately</span>
                    <span className="text-slate-300 text-[11px]">Their Dean / Admin logs in with full control over their own classrooms, course sections, and students without seeing other schools.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Active Institution: <span className="font-bold text-slate-900 dark:text-white">{currentInstitution.name}</span> ({currentInstitution.code})
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
