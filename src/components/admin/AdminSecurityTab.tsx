import React, { useState } from 'react';
import { ShieldCheck, KeyRound, User, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, Save, LogOut } from 'lucide-react';
import { storage, AdminCredentials } from '../../services/storage';

interface AdminSecurityTabProps {
  onLogout: () => void;
}

export const AdminSecurityTab: React.FC<AdminSecurityTabProps> = ({ onLogout }) => {
  const [credentials, setCredentials] = useState<AdminCredentials>(() => storage.getAdminCredentials());
  const [userIdInput, setUserIdInput] = useState(credentials.userId);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const cleanUser = userIdInput.trim();
    if (!cleanUser) {
      setErrorMessage('ইউজার আইডি খালি রাখা যাবে না!');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না!');
      return;
    }

    const updated = storage.updateAdminCredentials({
      userId: cleanUser,
      ...(newPassword ? { password: newPassword } : {}),
      lastLogin: new Date().toISOString(),
    });

    setCredentials(updated);
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMessage('ইউজার আইডি ও পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Admin Security & Login Credentials</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            এডমিন ড্যাশবোর্ডে প্রবেশের জন্য আপনার গোপন ইউজার আইডি ও পাসওয়ার্ড এখান থেকে পরিবর্তন ও নিয়ন্ত্রণ করুন।
          </p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>লগআউট (Logout)</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-medium animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Current Active Info Box */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            বর্তমান সক্রিয় এক্সেস তথ্য (Active Access Info)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">ইউজার আইডি (User ID)</span>
              <span className="font-bold text-slate-800 text-sm font-mono">{credentials.userId}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">সিকিউরিটি লেভেল (Role)</span>
              <span className="font-bold text-emerald-700 text-sm">Super Admin</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">লগইন URL প্যারামিটার</span>
              <span className="font-mono text-slate-600 text-[11px] truncate">/?route=admin</span>
            </div>
          </div>
        </div>

        {/* Change Credentials Form */}
        <form onSubmit={handleUpdateCredentials} className="space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>ইউজার আইডি ও পাসওয়ার্ড পরিবর্তন করুন</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono focus:border-emerald-600 outline-none"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">লগইন করার সময় এই আইডি ব্যবহার করতে হবে।</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                নতুন পাসওয়ার্ড (New Password)
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
              <p className="text-[10px] text-slate-400 mt-1">পাসওয়ার্ড পরিবর্তন করতে চাইলে এখানে নতুনটি লিখুন।</p>
            </div>

            {newPassword && (
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  পাসওয়ার্ড নিশ্চিত করুন (Confirm New Password)
                </label>
                <div className="relative flex items-center sm:max-w-md">
                  <span className="absolute left-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="একই নতুন পাসওয়ার্ড পুনরায় লিখুন"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono focus:border-emerald-600 outline-none"
                    required={Boolean(newPassword)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>আপডেট সেভ করুন (Save Changes)</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security Guidance Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
        <h4 className="font-bold flex items-center gap-1.5 text-amber-950">
          <span>🔒 এডমিন এক্সেস সিকিউরিটি টিপস:</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
          <li>সাধারণ গ্রাহকরা যাতে এডমিন প্যানেল দেখতে না পারে সেজন্য পাবলিক হেডার থেকে "Admin Panel" বাটনটি সম্পূর্ণ লুকিয়ে রাখা হয়েছে।</li>
          <li>এডমিন হিসেবে প্রবেশ করার জন্য আপনার ওয়েবসাইটের URL এর শেষে <strong>/?route=admin</strong> লিখে প্রবেশ করবেন।</li>
          <li>পাসওয়ার্ড কাউকে শেয়ার করবেন না। কাজ শেষ হলে ডান পাশের "Logout" বাটনে ক্লিক করে সেশন শেষ করুন।</li>
        </ul>
      </div>
    </div>
  );
};
