import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Commission } from '../types';
import { COMMISSION_TYPES, STEPS } from '../constants';
import ProgressBar from './ProgressBar';

interface ClientViewProps {
  commissions: Commission[];
}

const ClientView: React.FC<ClientViewProps> = ({ commissions }) => {
  const [searchNickname, setSearchNickname] = useState('');
  const [searchResults, setSearchResults] = useState<Commission[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchNickname.trim()) return;
    setHasSearched(true);
    // Filter to find ALL matches, not just the first one
    const results = commissions.filter(c => c.clientName.toLowerCase().includes(searchNickname.trim().toLowerCase()));
    setSearchResults(results);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">追蹤你的進度</h2>
        <p className="text-gray-500 font-medium">請輸入你在委託時使用的 暱稱</p>
      </div>

      <div className="flex gap-2 p-2 bg-white rounded-2xl shadow-xl shadow-rose-100/20 border border-rose-50 w-full max-w-full overflow-hidden">
        <input 
          type="text" 
          placeholder="例如: 沈梨"
          className="flex-1 min-w-0 px-3 md:px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all font-medium text-sm md:text-base"
          value={searchNickname}
          onChange={(e) => setSearchNickname(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={handleSearch}
          className="shrink-0 bg-rose-400 hover:bg-rose-500 text-white px-4 md:px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 font-bold shadow-lg shadow-rose-100 whitespace-nowrap"
        >
          <Search size={18} />
          <span>查詢</span>
        </button>
      </div>

      <div className="space-y-6">
        {hasSearched && searchResults && searchResults.length > 0 && (
          <div className="flex items-center justify-center mb-2">
            <span className="bg-rose-100 text-rose-500 px-3 py-1 rounded-full text-xs font-bold">
              找到 {searchResults.length} 筆結果
            </span>
          </div>
        )}

        {hasSearched && searchResults && searchResults.map((result) => (
          <div key={result.id} className="bg-white p-8 rounded-3xl border border-rose-50 shadow-lg animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-3 py-1 bg-rose-50 text-rose-500 text-xs font-bold rounded-full mb-2 border border-rose-100">
                  {COMMISSION_TYPES[result.type]}
                </span>
                <h3 className="text-2xl font-bold text-gray-800 break-words">{result.clientName}</h3>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                  {result.ownerName && `委託老師: ${result.ownerName}`}
                </p>
              </div>
              <div className="text-right flex flex-col items-end pl-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">目前狀態</p>
                <div className="bg-rose-100/80 px-4 py-3 rounded-2xl border border-rose-200 shadow-sm whitespace-nowrap">
                  <p className="text-lg md:text-xl font-bold text-rose-600 leading-none">
                    {STEPS[result.type][result.status].label}
                  </p>
                  <p className="text-xs font-bold text-rose-400 mt-1">
                    {STEPS[result.type][result.status].sub}
                  </p>
                </div>
              </div>
            </div>

            <ProgressBar type={result.type} currentStatus={result.status} />

            <div className="bg-rose-50/30 p-4 rounded-xl border border-dashed border-rose-200 mt-2">
              <p className="text-xs font-bold text-rose-400 mb-2 uppercase tracking-tighter">製作備註：</p>
              <p className="text-gray-700 italic font-medium leading-relaxed">
                {result.note || "製作順利進行中，請耐心等候 ✨"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {hasSearched && searchResults && searchResults.length === 0 && (
        <div className="text-center p-12 text-gray-400 animate-pulse bg-white rounded-3xl border-2 border-dashed border-rose-100 font-medium">
          找不到這個暱稱呢，請檢查輸入是否正確喔 🥺
        </div>
      )}
    </div>
  );
};

export default ClientView;