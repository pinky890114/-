import React, { useState } from 'react';
import { Plus, LogOut, UserCircle, ClipboardList, Camera, Trash2 } from 'lucide-react';
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

  // Filter commissions owned by the current admin
  const filteredCommissions = commissions.filter(c => c.ownerId === currentAdmin.ownerId);

  // Wrapper to handle closing logic
  const handleAddSubmit = async (data: CommissionFormData) => {
    // We await here so that if onAdd fails, we don't close the modal
    await onAdd(data);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 bg-white p-4 rounded-2xl border border-rose-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-rose-100 text-rose-500 p-2.5 rounded-xl">
            <UserCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">目前登入老師</p>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">{currentAdmin.name} 的後台</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-sm bg-rose-400 text-white px-5 py-2.5 rounded-xl hover:bg-rose-500 transition-all shadow-md shadow-rose-100 font-bold"
          >
            <Plus size={18} /> 新增委託
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-sm bg-gray-100 text-gray-500 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all font-bold"
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
        <p className="text-sm font-bold text-gray-400 tracking-widest uppercase px-1">我的委託項目 ({filteredCommissions.length})</p>

        {filteredCommissions.length === 0 && !isAdding && (
          <div className="text-center py-20 text-gray-300 border-4 border-dashed border-rose-50 bg-white rounded-[2.5rem]">
            <p className="font-bold">您目前還沒有建立任何委託紀錄喔</p>
          </div>
        )}
        
        {filteredCommissions.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-3xl border border-rose-50 shadow-sm hover:shadow-md transition-all border-l-4 border-l-rose-400">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${item.type === 'FLOWING_SAND' ? 'bg-rose-50 text-rose-500' : 'bg-rose-50 text-rose-400'}`}>
                  {item.type === 'FLOWING_SAND' ? <ClipboardList size={22} /> : <Camera size={22} />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{item.clientName}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {item.clientId}</p>
                </div>
              </div>
              <button 
                onClick={() => onDelete(item.id)}
                className="p-2 text-gray-200 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 px-1 uppercase tracking-tighter">
                <span>目前進度：{STEPS[item.type][item.status].label}</span>
                <span className="text-rose-500 font-bold">{Math.round(((item.status + 1)/STEPS[item.type].length)*100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max={STEPS[item.type].length - 1}
                value={item.status}
                onChange={(e) => onUpdateStatus(item.id, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;