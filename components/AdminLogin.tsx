import React, { useState } from 'react';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { AdminUser } from '../types';

interface AdminLoginProps {
  onLogin: (admin: AdminUser) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [adminInputCode, setAdminInputCode] = useState('');
  const [authError, setAuthError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCode = adminInputCode.trim();

    if (!targetCode) {
      setErrorMessage('請輸入密碼');
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
      return;
    }

    if (targetCode === 'pinky890114') {
      // Create the user object
      const adminInfo: AdminUser = {
        name: '沈梨', 
        ownerId: 'Main_Artist'
      };

      // Call the login callback immediately
      onLogin(adminInfo);
      
    } else {
      setErrorMessage('密碼錯誤');
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl shadow-[#A67C52]/10 border border-[#E6DCC3] text-center animate-in fade-in zoom-in-95 duration-500 mt-20">
      <div className="w-16 h-16 bg-[#F9F5F0] text-[#A67C52] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-[#E6DCC3]">
        <Lock size={32} />
      </div>
      
      {/* Text removed as requested, only icon remains above */}
      
      <form onSubmit={handleAdminLogin} className="space-y-4">
        <div className="relative">
          <input 
            type="password"
            placeholder="Password"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-center font-bold tracking-widest text-lg text-[#5C4033] ${authError ? 'border-red-300 bg-red-50 ring-2 ring-red-100 placeholder:text-red-300' : 'border-[#E6DCC3] focus:border-[#A67C52] bg-[#F9F5F0] placeholder:text-[#D6C0B3]'}`}
            value={adminInputCode}
            onChange={(e) => setAdminInputCode(e.target.value)}
            autoFocus
          />
          {authError && (
            <div className="absolute -bottom-6 left-0 right-0 text-red-400 text-[10px] font-bold flex items-center justify-center gap-1 animate-in slide-in-from-top-1">
              <AlertCircle size={12} /> {errorMessage}
            </div>
          )}
        </div>
        <button 
          type="submit"
          className="w-full bg-[#BC4A3C] hover:bg-[#A33E32] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#BC4A3C]/20 transition-all active:scale-95 mt-6 flex items-center justify-center gap-2 group"
        >
          <span>Login</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;