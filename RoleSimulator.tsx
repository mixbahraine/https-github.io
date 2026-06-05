import { User } from '../types';
import { Sparkles, Users, Crown, LogIn } from 'lucide-react';

interface RoleSimulatorProps {
  currentUser: User | null;
  users: User[];
  onSwitchUser: (user: User | null) => void;
  onResetData: () => void;
}

export default function RoleSimulator({
  currentUser,
  users,
  onSwitchUser,
  onResetData
}: RoleSimulatorProps) {
  return (
    <div id="role-simulation-banner" className="bg-gradient-to-r from-red-900 via-red-800 to-[#1e0506] text-white py-3 px-4 shadow-inner border-b border-red-700 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
        {/* Left Side: Notice & State */}
        <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
          <span className="bg-amber-500 text-black font-extrabold text-[11px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> نظام المحاكاة التفاعلية
          </span>
          <p className="text-xs md:text-sm text-red-100 font-medium text-center md:text-right">
            اختبر تدفق الأنظمة بالكامل ومثّل الأدوار المختلفة بضغطة زر:
          </p>
        </div>

        {/* Right Side: Navigation & Action triggers */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {/* Admin Fast button */}
          <button
            onClick={() => {
              const activeAdmin = users.find(u => u.email === 'al7anjri@gmail.com');
              if (activeAdmin) onSwitchUser(activeAdmin);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              currentUser?.email === 'al7anjri@gmail.com'
                ? 'bg-red-600 text-white ring-2 ring-white scale-105'
                : 'bg-white/10 text-red-200 hover:bg-white/20'
            }`}
          >
            <Crown className="w-3.5 h-3.5" /> دخول كمدير (al7anjri@gmail.com)
          </button>

          {/* Promoted Vendor Fast login */}
          <button
            onClick={() => {
              const vendor = users.find(u => u.role === 'vendor');
              if (vendor) onSwitchUser(vendor);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              currentUser?.role === 'vendor' && currentUser.email !== 'al7anjri@gmail.com'
                ? 'bg-green-600 text-white ring-2 ring-white scale-105'
                : 'bg-white/10 text-green-200 hover:bg-white/20'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> دخول كبائع مرقّى (أم يوسف)
          </button>

          {/* Guest Fast login */}
          <button
            onClick={() => {
              const guest = users.find(u => u.role === 'user');
              if (guest) onSwitchUser(guest);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              currentUser?.role === 'user'
                ? 'bg-blue-600 text-white ring-2 ring-white scale-105'
                : 'bg-white/10 text-blue-200 hover:bg-white/20'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> دخول كزائر مسجل (ميثم)
          </button>

          {/* Logout button (anonymous visitor) */}
          <button
            onClick={() => onSwitchUser(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentUser === null
                ? 'bg-white text-gray-900 font-extrabold ring-2 ring-red-500'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            التصفح كزائر مجهول (بدون حساب)
          </button>

          <span className="text-red-400">|</span>
          
          {/* Reset simulation State */}
          <button
            onClick={() => {
              if (window.confirm('هل تريد إعادة تعيين كافة البيانات والمحاكيات إلى وضعها التجريبي الأصلي الأصيل؟')) {
                onResetData();
              }
            }}
            className="text-[10px] text-red-300 hover:text-white underline font-semibold px-1 py-1"
          >
            إعادة ضبط المصنع للبيانات
          </button>
        </div>
      </div>
    </div>
  );
}
