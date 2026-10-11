import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowLeft, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { storage } from '../../services/storage';

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentCreds = storage.getAdminCredentials();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const storedCreds = storage.getAdminCredentials();
      const inputUser = userId.trim();
      const inputPass = password;

      // Check username/userId and password (case-insensitive for username)
      if (
        inputUser.toLowerCase() === storedCreds.userId.toLowerCase() &&
        inputPass === storedCreds.password
      ) {
        // Successful login
        storage.setAdminLoggedIn({
          userId: storedCreds.userId,
          name: storedCreds.name || 'Store Super Admin',
        });
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('ভুল ইউজার আইডি অথবা পাসওয়ার্ড! দয়া করে সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।');
      }
    }, 400);
  };

  const handleUseDefaultCreds = () => {
    setUserId(currentCreds.userId);
    setPassword(currentCreds.password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051c14] via-[#092b1f] to-[#0d3b2a] flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-500/20 text-slate-800 p-6 sm:p-8 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Lock Icon */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-900 text-emerald-300 shadow-inner mb-1 border border-emerald-700/50">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200">
            Restricted Admin Area
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            এডমিন সিকিউর লগইন
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            দয়া করে আপনার নির্দিষ্ট ইউজার আইডি এবং পাসওয়ার্ড দিয়ে এডমিন প্যানেলে প্রবেশ করুন।
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="যেমন: admin"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">
                পাসওয়ার্ড (Password)
              </label>
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
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
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

          {/* Remember me & Helper */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-emerald-700 focus:ring-emerald-600"
              />
              <span className="font-medium text-[11px]">এই ডিভাইসে সেশন মনে রাখুন</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-[#0A281E] hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-emerald-300" />
                <span>লগইন করুন (Sign In to Dashboard)</span>
              </>
            )}
          </button>
        </form>

        {/* Credentials Info Badge (Created for Store Owner) */}
        <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>আপনার এডমিন লগইন ক্রেডেনশিয়াল:</span>
            </div>
            <button
              type="button"
              onClick={handleUseDefaultCreds}
              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded cursor-pointer"
            >
              স্বয়ংক্রিয় পূরণ করুন
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2 rounded-lg border border-emerald-100">
            <div>
              <span className="text-slate-400 block text-[9px] font-sans">User ID</span>
              <span className="font-bold text-slate-800 select-all">{currentCreds.userId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] font-sans">Password</span>
              <span className="font-bold text-slate-800 select-all">{currentCreds.password}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            * লগইন করার পর ড্যাশবোর্ডের "Admin Security" ট্যাব থেকে আপনি যেকোনো সময় আপনার ইউজার আইডি ও পাসওয়ার্ড পরিবর্তন করতে পারবেন।
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
    </div>
  );
};
