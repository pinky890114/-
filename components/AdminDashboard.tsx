import React, { useState } from 'react';
import { Plus, LogOut, UserCircle, ClipboardList, Camera, Trash2, Mail, MessageSquare, Calendar } from 'lucide-react';
import { AdminUser, Commission, CommissionFormData } from '../types';
import { STEPS } from '../constants';
import CommissionForm from './CommissionForm';

interface AdminDashboardProps {
  currentAdmin: AdminUser;
  commissions: Commission[];
  onLogout: () => void;
  onAdd: (data: CommissionFormData) => Promise<void>;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: number) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentAdmin, 
  commissions, 
  onLogout, 
  onAdd, 
  onDelete, 
  onUpdateStatus 
}) => {
  const [isAdding, setIsAdding] = useState(false);

  // For single-user mode, we show ALL commissions regardless of ownerId
  const filteredCommissions = [...commissions];

  // Sort: Newest (by updatedAt) first
  filteredCommissions.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  const handleAddSubmit = async (data: CommissionFormData) => {
    await onAdd(data);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 bg-white p-4 rounded-2xl border border-[#E6DCC3] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#E6DCC3] text-[#8B5E3C] p-2.5 rounded-xl">
            <UserCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A67C52] uppercase tracking-widest">目前登入老師</p>
            <h2 className="text-lg font-bold text-[#5C4033] leading-tight">{currentAdmin.name} 的後台</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-sm bg-[#BC4A3C] text-white px-5 py-2.5 rounded-xl hover:bg-[#A33E32] transition-all shadow-md shadow-[#BC4A3C]/20 font-bold"
          >
            <Plus size={18} /> 建立委託
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-sm bg-[#F9F5F0] text-[#8B5E3C] px-4 py-2.5 rounded-xl hover:bg-[#E6DCC3] transition-all font-bold border border-[#E6DCC3]"
          >
            <LogOut size={16} /> 登出
          </button>
        </div>
      </div>

      {isAdding && (
        <CommissionForm 
          currentAdmin={currentAdmin} 
          onClose={() => setIsAdding(false)} 
          onSubmit={handleAddSubmit} 
        />
      )}

      {/* List of commissions */}
      <div className="space-y-4">
        <p className="text-sm font-bold text-[#A67C52] tracking-widest uppercase px-1">所有委託項目 ({filteredCommissions.length})</p>

        {filteredCommissions.length === 0 && !isAdding && (
          <div className="text-center py-20 text-[#D6C0B3] border-4 border-dashed border-[#E6DCC3] bg-white rounded-[2.5rem] flex flex-col items-center justify-center gap-2">
            <ClipboardList size={40} className="text-[#E6DCC3]" />
            <p className="font-bold">目前還沒有委託紀錄喔</p>
            <p className="text-xs">請點選上方「建立委託」或是等待學生提交申請</p>
          </div>
        )}
        
        {filteredCommissions.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-3xl border border-[#E6DCC3] shadow-sm hover:shadow-md transition-all border-l-4 border-l-[#A67C52] relative group">
            
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-1 transition-colors ${item.type === 'FLOWING_SAND' ? 'bg-[#F9F5F0] text-[#A67C52]' : 'bg-indigo-50 text-indigo-400'}`}>
                  {item.type === 'FLOWING_SAND' ? <ClipboardList size={22} /> : <Camera size={22} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#5C4033] text-lg">{item.clientName}</h4>
                    {/* New Request Badge */}
                    {item.status === 0 && item.description && (
                        <span className="bg-[#BC4A3C] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">新申請</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold text-[#D6C0B3] uppercase tracking-widest">
                     <span>ID: {item.clientId}</span>
                     
                     {/* Created At / Order Date */}
                     {item.createdAt && (
                       <>
                         <span>•</span>
                         <span className="flex items-center gap-1 text-[#A67C52]" title="下單日期">
                           <Calendar size={10} />
                           {new Date(item.createdAt).toLocaleDateString('zh-TW')}
                         </span>
                       </>
                     )}

                     {item.price !== undefined && item.price > 0 && (
                       <>
                         <span>•</span>
                         <span className="text-[#A67C52]">${item.price}</span>
                       </>
                     )}
                  </div>
                  
                  {/* Private Contact Info (Only visible to Admin) */}
                  {item.contactInfo && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#8B5E3C] bg-[#F9F5F0] px-2 py-1 rounded-lg w-fit">
                       <Mail size={12} className="text-[#A67C52]" />
                       {item.contactInfo}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Delete Button - Fixed: Added z-10, stopPropagation, and cursor-pointer */}
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Stop event bubbling
                  e.preventDefault();
                  onDelete(item.id);
                }}
                className="relative z-10 shrink-0 p-3 bg-white text-[#D6C0B3] hover:text-white hover:bg-red-400 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-400 hover:shadow-red-200 cursor-pointer active:scale-90"
                title="刪除"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Private Description (Only visible to Admin) */}
            {item.description && (
              <div className="mb-4 bg-[#F9F5F0] p-3 rounded-xl border border-[#E6DCC3]">
                 <p className="text-[10px] font-bold text-[#A67C52] uppercase tracking-widest mb-1 flex items-center gap-1">
                    <MessageSquare size={10} /> 客戶需求備註
                 </p>
                 <p className="text-sm text-[#5C4033] leading-relaxed whitespace-pre-line">
                    {item.description}
                 </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[10px] font-bold text-[#A67C52] mb-1 px-1 uppercase tracking-tighter">
                <span>目前進度：{STEPS[item.type][item.status].label}</span>
                <span className="text-[#BC4A3C] font-bold">{Math.round(((item.status + 1)/STEPS[item.type].length)*100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max={STEPS[item.type].length - 1}
                value={item.status}
                onChange={(e) => onUpdateStatus(item.id, parseInt(e.target.value))}
                className="w-full h-2 bg-[#E6DCC3] rounded-lg appearance-none cursor-pointer accent-[#BC4A3C]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;