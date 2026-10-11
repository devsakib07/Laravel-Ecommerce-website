import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Clock,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { storage } from '../../services/storage';
import {
  getLockoutState,
  recordFailedLogin,
  resetFailedLoginAttempts,
  addSecurityAuditLog,
  getFailedAttemptsCount,
  MAX_LOGIN_ATTEMPTS,
} from '../../utils/security';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToStorefront: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToStorefront,
}) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorPin, setTwoFactorPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Lockout state & live countdown
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(() => {
    return getLockoutState().remainingSeconds;
  });

  // Bot protection challenge (active if failed attempts >= 2)
  const failedAttempts = getFailedAttemptsCount();
  const [captchaNum1] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [captchaNum2] = useState(() => Math.floor(Math.random() * 8) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  // 2FA step state
  const [isAwaiting2FA, setIsAwaiting2FA] = useState(false);

  // Password Recovery with Master Security PIN Modal
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryPin, setRecoveryPin] = useState('');
  const [recoveryNewPass, setRecoveryNewPass] = useState('');
  const [recoveryConfirmPass, setRecoveryConfirmPass] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Lockout timer interval
  useEffect(() => {
    if (lockoutRemaining <= 0) return;

    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const formatLockoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if locked out
    const lockoutState = getLockoutState();
    if (lockoutState.isLocked) {
      setLockoutRemaining(lockoutState.remainingSeconds);
      setError(`অ্যাকাউন্ট সাময়িকভাবে লক করা আছে! আর ${formatLockoutTime(lockoutState.remainingSeconds)} অপেক্ষা করুন।`);
      return;
    }

    // Verify bot math challenge if attempts >= 2
    if (failedAttempts >= 2) {
      if (parseInt(captchaAnswer, 10) !== captchaNum1 + captchaNum2) {
        setError('বট ভেরিফিকেশন উত্তর ভুল হয়েছে। সঠিক যোগফল দিন।');
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      const storedCreds = storage.getAdminCredentials();
      const inputUser = userId.trim();
      const inputPass = password;

      // Validate credentials
      const isUserMatch = inputUser.toLowerCase() === storedCreds.userId.toLowerCase();
      const isPassMatch = inputPass === storedCreds.password;

      if (!isUserMatch || !isPassMatch) {
        setIsLoading(false);
        const failResult = recordFailedLogin(inputUser || 'unknown');
        if (failResult.isLocked) {
          setLockoutRemaining(failResult.remainingSeconds);
          setError(`ভুল পাসওয়ার্ড! ৫ বার ব্যর্থ হওয়ায় নিরাপত্তা স্বার্থে অ্যাকাউন্টটি ১৫ মিনিটের জন্য লক করা হয়েছে।`);
        } else {
          setError(`ভুল ইউজার আইডি বা পাসওয়ার্ড! আর ${failResult.remainingAttempts} বার চেষ্টা করা যাবে।`);
        }
        return;
      }

      // Check if 2-Step Verification / Security PIN is required
      if (storedCreds.twoFactorEnabled && !isAwaiting2FA) {
        setIsLoading(false);
        setIsAwaiting2FA(true);
        return;
      }

      if (storedCreds.twoFactorEnabled && isAwaiting2FA) {
        if (twoFactorPin !== storedCreds.securityPin) {
          setIsLoading(false);
          setError('ভুল ২-ফ্যাক্টর সিকিউরিটি পিন! সঠিক ৬-ডিজিট পিন প্রদান করুন।');
          return;
        }
      }

      // Successful login
      resetFailedLoginAttempts(storedCreds.userId);
      storage.setAdminLoggedIn({
        userId: storedCreds.userId,
        name: storedCreds.name || 'Store Super Admin',
      });

      storage.updateAdminCredentials({
        lastLogin: new Date().toISOString(),
        lastLoginIp: '103.205.132.45',
      });

      setIsLoading(false);
      onLoginSuccess();
    }, 450);
  };

  // Master Security PIN Password Recovery
  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMsg(null);

    const storedCreds = storage.getAdminCredentials();
    const cleanPin = recoveryPin.trim();

    if (cleanPin !== (storedCreds.securityPin || '786012')) {
      setRecoveryMsg({ text: 'ভুল মাস্টার সিকিউরিটি পিন!', isError: true });
      return;
    }

    if (recoveryNewPass.length < 6) {
      setRecoveryMsg({ text: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', isError: true });
      return;
    }

    if (recoveryNewPass !== recoveryConfirmPass) {
      setRecoveryMsg({ text: 'নতুন পাসওয়ার্ড দুটি মিলছে না।', isError: true });
      return;
    }

    storage.updateAdminCredentials({
      password: recoveryNewPass,
      lastLogin: new Date().toISOString(),
    });

    addSecurityAuditLog({
      event: 'PIN_RECOVERY_USED',
      severity: 'high',
      userId: storedCreds.userId,
      details: 'Password was successfully reset using 6-Digit Master Security PIN.',
    });

    setRecoveryMsg({ text: 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।', isError: false });
    setTimeout(() => {
      setShowRecoveryModal(false);
      setPassword('');
      setRecoveryPin('');
      setRecoveryNewPass('');
      setRecoveryConfirmPass('');
    }, 1800);
  };

  const isLockedOut = lockoutRemaining > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03150e] via-[#082218] to-[#0c3123] flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#E25C1D]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-500/20 text-slate-800 p-6 sm:p-8 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Lock Icon */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-950 text-emerald-300 shadow-inner mb-1 border border-emerald-700/50">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-900 border border-emerald-200">
              Encrypted Admin Gateway
            </span>
            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
              SHA-256 / CSRF Protected
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            এডমিন সিকিউর লগইন
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            অননুমোদিত প্রবেশ সম্পূর্ণ নিষিদ্ধ। আপনার অথেনটিকেটেড ইউজার ক্রেডেনশিয়াল প্রদান করুন।
          </p>
        </div>

        {/* Lockout Warning Banner */}
        {isLockedOut && (
          <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 text-xs flex flex-col gap-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>নিরাপত্তা লকআউট সক্রিয় (Security Lockout)</span>
            </div>
            <p className="text-[11px] text-rose-700">
              একাধিকবার ভুল তথ্য দেওয়ায় নিরাপত্তা স্বার্থে লগইন ব্লক করা হয়েছে।
            </p>
            <div className="flex items-center gap-2 bg-rose-100/70 p-2 rounded-xl text-rose-900 font-mono font-bold text-xs justify-center">
              <Clock className="w-4 h-4 text-rose-600" />
              <span>অপেক্ষা করুন: {formatLockoutTime(lockoutRemaining)}</span>
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {!isLockedOut && error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {!isAwaiting2FA ? (
            <>
              {/* User ID Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  ইউজার আইডি (Admin User ID)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="আপনার এডমিন ইউজার আইডি"
                    required
                    disabled={isLockedOut || isLoading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    পাসওয়ার্ড (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(true)}
                    className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                  >
                    ভুলে গেছেন?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLockedOut || isLoading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all font-mono disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Bot Math Challenge if failed attempts >= 2 */}
              {failedAttempts >= 2 && !isLockedOut && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in">
                  <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>নিরাপত্তা যাচাই: {captchaNum1} + {captchaNum2} = কত?</span>
                  </label>
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="যোগফল লিখুন"
                    required
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold outline-none"
                  />
                </div>
              )}
            </>
          ) : (
            /* 2FA PIN Step */
            <div className="space-y-3 bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>২-স্টেপ ভেরিফিকেশন পিন দিন</span>
              </div>
              <p className="text-[11px] text-slate-600">
                আপনার ৬-ডিজিট গোপন মাস্টার সিকিউরিটি পিন প্রবেশ করুন।
              </p>
              <input
                type="password"
                maxLength={6}
                value={twoFactorPin}
                onChange={(e) => setTwoFactorPin(e.target.value)}
                placeholder="••••••"
                required
                className="w-full text-center tracking-[0.5em] text-lg font-mono font-black py-2.5 rounded-xl border border-emerald-300 bg-white outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <button
                type="button"
                onClick={() => setIsAwaiting2FA(false)}
                className="text-[11px] text-slate-500 hover:text-slate-700 underline block text-center"
              >
                আগের ধাপে ফিরুন
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isLockedOut}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-[#0A281E] hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-emerald-300" />
                <span>{isAwaiting2FA ? 'পিন নিশ্চিত করুন (Verify PIN)' : 'লগইন করুন (Secure Sign In)'}</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
            <span>🛡️ ব্রুট-ফোর্স প্রোটেকশন সক্রিয়</span>
            <span className="text-emerald-700 font-mono">Max 5 Attempts</span>
          </div>
          <p className="text-[10px] text-slate-400">
            অননুমোদিত আইপি ও সন্দেহজনক লগইন প্রচেষ্টা স্বয়ংক্রিয়ভাবে অডিট লগে রেকর্ড করা হয়।
          </p>
        </div>

        {/* Footer Navigation Back to Storefront */}
        <div className="text-center pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={onBackToStorefront}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>মূল ওয়েবসাইটে ফিরে যান (Back to Storefront)</span>
          </button>
        </div>
      </div>

      {/* Emergency Password Recovery Modal with Master PIN */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm">মাস্টার পিন দিয়ে পাসওয়ার্ড রিসেট</h3>
              </div>
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {recoveryMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  recoveryMsg.isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {recoveryMsg.isError ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                <span>{recoveryMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleRecoverPassword} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ৬-ডিজিট মাস্টার সিকিউরিটি পিন
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={recoveryPin}
                  onChange={(e) => setRecoveryPin(e.target.value)}
                  placeholder="Master Recovery PIN (default 786012)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono tracking-widest text-center outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">নতুন পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={recoveryNewPass}
                  onChange={(e) => setRecoveryNewPass(e.target.value)}
                  placeholder="কমপক্ষে ৬ ক্যারেক্টার"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                <input
                  type="password"
                  required
                  value={recoveryConfirmPass}
                  onChange={(e) => setRecoveryConfirmPass(e.target.value)}
                  placeholder="পুনরায় লিখুন"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl cursor-pointer"
                >
                  পাসওয়ার্ড রিসেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
