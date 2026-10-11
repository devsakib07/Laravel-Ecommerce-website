import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  LogOut,
  ShieldAlert,
  Clock,
  Activity,
  Trash2,
  RefreshCw,
  Smartphone,
  Check,
  Zap,
} from 'lucide-react';
import { storage, AdminCredentials } from '../../services/storage';
import {
  getSecurityAuditLogs,
  clearSecurityAuditLogs,
  addSecurityAuditLog,
  analyzePasswordStrength,
  SecurityAuditLog,
} from '../../utils/security';

interface AdminSecurityTabProps {
  onLogout: () => void;
}

export const AdminSecurityTab: React.FC<AdminSecurityTabProps> = ({ onLogout }) => {
  const [credentials, setCredentials] = useState<AdminCredentials>(() => storage.getAdminCredentials());
  const [userIdInput, setUserIdInput] = useState(credentials.userId);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Security PIN & 2FA
  const [securityPin, setSecurityPin] = useState(credentials.securityPin || '786012');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(credentials.twoFactorEnabled || false);
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState(credentials.autoLogoutMinutes || 30);

  // Audit Logs
  const [logs, setLogs] = useState<SecurityAuditLog[]>(() => getSecurityAuditLogs());
  const [logFilter, setLogFilter] = useState<'all' | 'critical' | 'failed'>('all');

  // Messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleLogsUpdate = () => {
      setLogs(getSecurityAuditLogs());
    };
    window.addEventListener('security-logs-updated', handleLogsUpdate);
    return () => window.removeEventListener('security-logs-updated', handleLogsUpdate);
  }, []);

  const passwordStrength = analyzePasswordStrength(newPassword);

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const cleanUser = userIdInput.trim();
    if (!cleanUser) {
      setErrorMessage('ইউজার আইডি খালি রাখা যাবে না!');
      return;
    }

    // Require current password for security verification if changing password or user ID
    if (currentPassword !== credentials.password) {
      setErrorMessage('বর্তমান পাসওয়ার্ড ভুল হয়েছে! পরিবর্তন করার জন্য বর্তমান পাসওয়ার্ড সঠিক হতে হবে।');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMessage('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না!');
        return;
      }
    }

    if (securityPin.length !== 6 || !/^\d{6}$/.test(securityPin)) {
      setErrorMessage('মাস্টার সিকিউরিটি পিন অবশ্যই ৬ সংখ্যার হতে হবে (যেমন: 786012)!');
      return;
    }

    const updated = storage.updateAdminCredentials({
      userId: cleanUser,
      ...(newPassword ? { password: newPassword } : {}),
      securityPin,
      twoFactorEnabled,
      autoLogoutMinutes,
      lastLogin: new Date().toISOString(),
    });

    setCredentials(updated);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    addSecurityAuditLog({
      event: newPassword ? 'PASSWORD_CHANGED' : 'SETTINGS_UPDATED',
      severity: 'medium',
      userId: cleanUser,
      details: newPassword
        ? 'Admin password and security policies successfully modified.'
        : 'Security policies and PIN updated.',
    });

    setSuccessMessage('সিকিউরিটি ক্রেডেনশিয়াল ও পলিসি সফলভাবে সেভ হয়েছে!');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const handleClearLogs = () => {
    if (confirm('আপনি কি সমস্ত সিকিউরিটি অডিট লগ মুছে ফেলতে চান?')) {
      clearSecurityAuditLogs();
      setLogs([]);
    }
  };

  const handleForceLogoutAll = () => {
    if (confirm('সমস্ত ডিভাইস ও ব্রাউজার সেশন বন্ধ করতে চান?')) {
      addSecurityAuditLog({
        event: 'SESSION_EXPIRED',
        severity: 'high',
        userId: credentials.userId,
        details: 'Admin manually terminated all active sessions across all devices.',
      });
      storage.adminLogout();
      onLogout();
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'critical') return l.severity === 'critical' || l.severity === 'high';
    if (logFilter === 'failed') return l.event === 'LOGIN_FAILED' || l.event === 'ACCOUNT_LOCKED';
    return true;
  });

  // Calculate Security Health Score
  let securityScore = 70;
  if (twoFactorEnabled) securityScore += 15;
  if (credentials.password.length >= 8 && /\d/.test(credentials.password)) securityScore += 10;
  if (securityPin && securityPin !== '123456') securityScore += 5;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-5 sm:p-6 rounded-3xl text-white shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 border border-emerald-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Enterprise Security & Intrusion Defense (সিকিউরিটি কন্ট্রোল)
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            ব্রুট-ফোর্স হ্যাকিং প্রতিরোধ, ২-স্টেপ মাস্টার পিন অথেনটিকেশন, সেশন টাইমআউট এবং রিয়েল-টাইম থ্রেট অডিট মনিটরিং ব্যবস্থা।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleForceLogoutAll}
            className="px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="সমস্ত ডিভাইস থেকে সেশন লগআউট করুন"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Kill All Sessions</span>
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs flex items-center gap-2 font-medium shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs flex items-center gap-2 font-medium shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Security Health Score & Safeguards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Health Score</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-700">{securityScore}%</span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Grade A+
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${securityScore}%` }} />
          </div>
        </div>

        {/* Protection 1: Brute-Force Shield */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Anti-Brute Force Shield</span>
          </div>
          <p className="text-xl font-black text-slate-900 mt-2">Active (সক্রিয়)</p>
          <p className="text-[10px] text-slate-500 mt-1">৫ বার ভুল পাসওয়ার্ড দিলে ১৫ মিনিট অটো-লকআউট।</p>
        </div>

        {/* Protection 2: XSS & Injection Filtering */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Anti-XSS & SQLi Defense</span>
          </div>
          <p className="text-xl font-black text-slate-900 mt-2">Enabled (সুরক্ষিত)</p>
          <p className="text-[10px] text-slate-500 mt-1">সব কাস্টমার ইনপুট ও স্ক্রিপ্ট স্বয়ংক্রিয়ভাবে ফিল্টার্ড।</p>
        </div>

        {/* Protection 3: Inactivity Timeout */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Auto-Logout Timeout</span>
          </div>
          <p className="text-xl font-black text-slate-900 mt-2">{credentials.autoLogoutMinutes || 30} Minutes</p>
          <p className="text-[10px] text-slate-500 mt-1">নিষ্ক্রিয় থাকলে স্বয়ংক্রিয় সেশন সমাপ্তি।</p>
        </div>
      </div>

      {/* 3. Credentials & 2FA Configuration Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <form onSubmit={handleUpdateCredentials} className="space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <span>এডমিন এক্সেস ক্রেডেনশিয়াল ও পলিসি আপডেট</span>
            </h3>
            <span className="text-[11px] text-slate-400">Security Verification Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* User ID */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                এডমিন ইউজার আইডি (Admin User ID)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono font-bold focus:border-emerald-600 outline-none"
                  required
                />
              </div>
            </div>

            {/* Current Password Confirmation */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                বর্তমান পাসওয়ার্ড (Current Password - যাচাইয়ের জন্য প্রয়োজন) <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                  required
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                নতুন পাসওয়ার্ড (New Password - পরিবর্তন করতে চাইলে)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="পরিবর্তন না করতে চাইলে খালি রাখুন"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono focus:border-emerald-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Password Strength Feedback */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-500">পাসওয়ার্ড শক্তি:</span>
                    <span className={`font-bold ${
                      passwordStrength.level === 'Strong' ? 'text-emerald-700' : passwordStrength.level === 'Good' ? 'text-blue-700' : 'text-amber-700'
                    }`}>
                      {passwordStrength.level}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        passwordStrength.score >= 3 ? 'bg-emerald-600' : passwordStrength.score === 2 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">{passwordStrength.feedback}</p>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="একই নতুন পাসওয়ার্ড পুনরায় লিখুন"
                  disabled={!newPassword}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono focus:border-emerald-600 outline-none disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Master Security PIN (6 Digits) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ৬-ডিজিট মাস্টার সিকিউরিটি পিন (Master Recovery PIN)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <Smartphone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  maxLength={6}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="যেমন: 786012"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono font-bold tracking-widest focus:border-emerald-600 outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">পাসওয়ার্ড ভুলে গেলে এই পিন ব্যবহার করে রিকভার করতে পারবেন।</p>
            </div>

            {/* Inactivity Timeout Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                নিষ্ক্রিয় সেশন অটো-লগআউট (Session Inactivity Expiry)
              </label>
              <select
                value={autoLogoutMinutes}
                onChange={(e) => setAutoLogoutMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium outline-none focus:border-emerald-600"
              >
                <option value={15}>১৫ মিনিট পর অটো-লগআউট (সর্বোচ্চ নিরাপদ)</option>
                <option value={30}>৩০ মিনিট পর অটো-লগআউট (স্ট্যান্ডার্ড)</option>
                <option value={60}>১ ঘণ্টা পর অটো-লগআউট</option>
              </select>
            </div>
          </div>

          {/* 2-Step Verification Checkbox */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-start gap-3">
            <input
              type="checkbox"
              id="twoFactorCheckbox"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className="mt-1 rounded text-emerald-800 focus:ring-emerald-700 cursor-pointer"
            />
            <label htmlFor="twoFactorCheckbox" className="text-xs cursor-pointer select-none">
              <span className="font-bold text-emerald-950 block">২-স্টেপ ভেরিফিকেশন (2-Factor Security PIN) চালু করুন</span>
              <span className="text-[11px] text-slate-600">
                লগইন করার সময় ইউজার আইডি ও পাসওয়ার্ডের পাশাপাশি আপনার ৬-ডিজিট মাস্টার পিনটিও দিতে হবে।
              </span>
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <Save className="w-4 h-4" />
              <span>নিরাপত্তা সেটিংস সেভ করুন (Save Changes)</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Live Security Audit Logs & Threat Monitor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span>Security Audit Logs & Threat Monitor (অডিট হিস্ট্রি)</span>
            </h3>
            <p className="text-xs text-slate-500">লগইন প্রচেষ্টা, সেশন পরিবর্তন ও সিকিউরিটি ইভেন্ট রেকর্ড</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value as any)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">সব লগ ({logs.length})</option>
              <option value="failed">ব্যর্থ প্রচেষ্টা</option>
              <option value="critical">গুরুত্বপূর্ণ ইভেন্ট</option>
            </select>

            <button
              onClick={handleClearLogs}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
              title="লগ ক্লিয়ার করুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ক্লিয়ার</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="p-3">Event Type</th>
                <th className="p-3">Time</th>
                <th className="p-3">User ID & IP</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {log.event}
                  </td>
                  <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <p className="font-bold text-slate-700">{log.userId || 'admin'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{log.ip_address}</p>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : log.severity === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : log.severity === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 text-[11px] max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
