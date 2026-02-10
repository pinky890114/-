import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { AdminUser, CommissionFormData, CommissionType } from '../types';
import { STEPS } from '../constants';

interface CommissionFormProps {
  currentAdmin: AdminUser;
  onClose: () => void;
  onSubmit: (data: CommissionFormData) => Promise<void>;
}

const CommissionForm: React.FC<CommissionFormProps> = ({ currentAdmin, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CommissionFormData>({
    clientId: '',
    clientName: '',
    type: 'FLOWING_SAND',
    status: 0,
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate inputs
    const trimmedId = formData.clientId.trim();
    const trimmedName = formData.clientName.trim();
    
    if (!trimmedId || !trimmedName) {
      setError("請填寫所有必要欄位");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("請求逾時，請檢查網路連線")), 10000)
      );

      // Race against the actual submission
      await Promise.race([
        onSubmit({
          ...formData,
          clientId: trimmedId,
          clientName: trimmedName
        }),
        timeoutPromise
      ]);
      // If successful, the parent component handles closing
    } catch (err: any) {
      console.error(err);
      setError(err.message || "新增失敗，請檢查網路或稍後再試。");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-rose-50 shadow-xl mb-8 animate-in slide-in-from-top-4 relative">
      <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-gray-800">建立由「{currentAdmin.name}」老師負責的委託</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-300 hover:text-gray-500 transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl text-sm font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-widest">內部管理 ID (不重複)</label>
          <input 
            required
            disabled={isSubmitting}
            className="w-full border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-rose-100 rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50"
            placeholder="例如: SN-001"
            value={formData.clientId}
            onChange={e => setFormData({...formData, clientId: e.target.value})}
          />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-widest">客戶暱稱 (查詢用)</label>
          <input 
            required
            disabled={isSubmitting}
            className="w-full border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-rose-100 rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50"
            placeholder="例如: 沈梨"
            value={formData.clientName}
            onChange={e => setFormData({...formData, clientName: e.target.value})}
          />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-widest">委託類型</label>
          <select 
            disabled={isSubmitting}
            className="w-full border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-rose-100 rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50"
            value={formData.type}
            onChange={e => {
              const newType = e.target.value as CommissionType;
              // Reset status if needed, though here 0 is safe
              setFormData({...formData, type: newType, status: 0});
            }}
          >
            <option value="FLOWING_SAND">流麻</option>
            <option value="SCREENSHOT">截圖</option>
          </select>
        </div>
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-widest">初始階段</label>
          <select 
            disabled={isSubmitting}
            className="w-full border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-rose-100 rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50"
            value={formData.status}
            onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}
          >
            {STEPS[formData.type].map((s, i) => <option key={i} value={i}>{s.label}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-widest">備註訊息 (客戶可見)</label>
          <textarea 
            disabled={isSubmitting}
            className="w-full border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-rose-100 rounded-xl p-2.5 text-sm transition-all outline-none font-medium disabled:opacity-50"
            rows={2}
            value={formData.note}
            onChange={e => setFormData({...formData, note: e.target.value})}
          />
        </div>
        <div className="col-span-2 flex justify-end gap-3 mt-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            取消
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-rose-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-100 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>處理中...</span>
              </>
            ) : (
              <span>儲存委託</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommissionForm;