import React, { useState } from 'react';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { AdminUser } from '../types';

interface AdminLoginProps {
  onLogin: (admin: AdminUser) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [adminInputCode, setAdminInputCode] = useState('');
  const [authError, setAuthError] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow case-sensitive or insensitive? Trimming whitespace is generally good practice.
    // Removing toUpperCase() allows users to use specific IDs like 'shenli_01' if they wish.
    const targetCode = adminInputCode.trim();

    if (targetCode) {
      // Dynamic login: The code itself serves as the identifier and display name
      const adminInfo: AdminUser = {
        name: targetCode, 
        ownerId: targetCode
      };

      onLogin(adminInfo);
      setAuthError(false);
      setAdminInputCode('');
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl shadow-rose-100/30 border border-rose-50 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">老師後台登入</h2>
      <p className="text-gray-500 text-sm mb-6 font-medium">請輸入任意代碼以建立或進入您的專屬工作區</p>
      
      <form onSubmit={handleAdminLogin} className="space-y-4">
        <div className="relative">
          <input 
            type="text"
            placeholder="設定您的老師代碼"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-center font-bold tracking-widest ${authError ? 'border-red-300 bg-red-50 ring-2 ring-red-100' : 'border-gray-100 focus:border-rose-200 bg-gray-50'}`}
            value={adminInputCode}
            onChange={(e) => setAdminInputCode(e.target.value)}
            autoFocus
          />
          {authError && (
            <div className="absolute -bottom-6 left-0 right-0 text-red-400 text-[10px] font-bold flex items-center justify-center gap-1">
              <AlertCircle size={12} /> 請輸入代碼
            </div>
          )}
        </div>
        <button 
          type="submit"
          className="w-full bg-rose-400 hover:bg-rose-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-rose-100 transition-all active:scale-95 mt-4 flex items-center justify-center gap-2"
        >
          <span>進入後台</span>
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;