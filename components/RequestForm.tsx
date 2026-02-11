import React, { useState } from 'react';
import { X, Send, Sparkles, Loader2, AlertCircle, ScrollText, CheckSquare, Square, ArrowRight, Package, Check, Tag, Minus, Plus, Coins, MessageSquare, CheckCircle2 } from 'lucide-react';
import { CommissionFormData, CommissionType } from '../types';
import { COMMISSION_TYPES } from '../constants';

interface RequestFormProps {
  onClose: () => void;
  onSubmit: (data: CommissionFormData) => Promise<void>;
  initialType?: CommissionType;
}

// Define Screenshot Products Configuration
const SCREENSHOT_PRODUCTS = [
  { id: 'S_RAW', label: '顯卡直出證件照', price: 20 },
  { id: 'S_AVATAR', label: '頭貼（1:1）', sub: '（可加ID）', price: 25 },
  { id: 'S_ID_9_16', label: '證件照（9:16）', price: 25 },
  { id: 'S_WALL_MOBILE', label: '手機桌布（9:16頭頂留空）', sub: '（人像風/意境風）', price: 25 },
  { id: 'S_WALL_PC', label: '電腦桌布', sub: '（人像風/意境風）', price: 25 },
  { id: 'S_COLLAGE_2', label: '2格出框拼貼', price: 50 },
  { id: 'S_COLLAGE_3', label: '3格出框拼貼', price: 100 },
  { id: 'S_DUO_ID', label: '雙人證件照', price: 30 },
  { id: 'S_DUO_PC', label: '雙人電腦桌布', price: 40 },
  { id: 'S_COUPLE_MOBILE', label: '情侶手機桌布', price: 50 },
  { id: 'S_CLUB_SPECIAL', label: '社團特殊委託項目', price: 10 },
];

const COLLAGE_2_OPTIONS = [
  '是，已儲存雲端預設外觀。',
  '店主搭—2格同外觀',
  '店主搭—2格不同外觀'
];

const COLLAGE_3_OPTIONS = [
  '是，已儲存雲端預設外觀。',
  '店主搭—3格同外觀',
  '店主搭—3格不同外觀'
];

const RequestForm: React.FC<RequestFormProps> = ({ onClose, onSubmit, initialType = 'FLOWING_SAND' }) => {
  const isScreenshot = initialType === 'SCREENSHOT';

  // Always show guidelines first
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [hasAgreed, setHasAgreed] = useState(false);

  // State for Flowing Sand Quantities
  const [sandQuantities, setSandQuantities] = useState({
    CARD_BOX: 1, 
    CHARM_BOX: 0
  });

  // State for Screenshot Quantities (Dynamic based on ID)
  const [screenshotQuantities, setScreenshotQuantities] = useState<Record<string, number>>({});
  
  // State for Custom Add-on (Only for Flowing Sand usually, but kept generally available if needed)
  const [isCustom, setIsCustom] = useState(false);

  // State for Client Remarks (Screenshot only)
  const [clientRemark, setClientRemark] = useState('');

  // Special State for "2格出框拼貼" (S_COLLAGE_2) Options
  const [showCollage2Modal, setShowCollage2Modal] = useState(false);
  const [collage2Option, setCollage2Option] = useState<string>('');

  // Special State for "3格出框拼貼" (S_COLLAGE_3) Options
  const [showCollage3Modal, setShowCollage3Modal] = useState(false);
  const [collage3Option, setCollage3Option] = useState<string>('');

  const [formData, setFormData] = useState<CommissionFormData>({
    ownerId: 'Main_Artist',
    clientName: '',
    contactInfo: '',
    type: isScreenshot ? 'SCREENSHOT' : 'FLOWING_SAND',
    status: 0,
    note: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Price Constants for Flowing Sand
  const PRICE_CARD = 400;
  const PRICE_CHARM = 350;
  const PRICE_CUSTOM = 500;

  // Calculate Total Price
  let totalPrice = 0;
  if (isScreenshot) {
    totalPrice = SCREENSHOT_PRODUCTS.reduce((acc, product) => {
      const qty = screenshotQuantities[product.id] || 0;
      return acc + (qty * product.price);
    }, 0);
  } else {
    totalPrice = (sandQuantities.CARD_BOX * PRICE_CARD) + (sandQuantities.CHARM_BOX * PRICE_CHARM) + (isCustom ? PRICE_CUSTOM : 0);
  }

  // Helper to update Flowing Sand quantity
  const updateSandQuantity = (product: 'CARD_BOX' | 'CHARM_BOX', delta: number) => {
    setSandQuantities(prev => {
      const newVal = Math.max(0, prev[product] + delta);
      return { ...prev, [product]: newVal };
    });
  };

  // Helper to toggle Flowing Sand selection
  const toggleSandProduct = (product: 'CARD_BOX' | 'CHARM_BOX') => {
    setSandQuantities(prev => ({
      ...prev,
      [product]: prev[product] > 0 ? 0 : 1
    }));
  };

  // Helper to update Screenshot quantity
  const updateScreenshotQuantity = (id: string, delta: number) => {
    setScreenshotQuantities(prev => {
      const current = prev[id] || 0;
      const newVal = Math.max(0, current + delta);
      
      // Trigger modal for S_COLLAGE_2
      if (id === 'S_COLLAGE_2' && current === 0 && newVal > 0) {
        setShowCollage2Modal(true);
        if (!collage2Option) setCollage2Option(COLLAGE_2_OPTIONS[0]);
      }
      if (id === 'S_COLLAGE_2' && newVal === 0) setCollage2Option('');

      // Trigger modal for S_COLLAGE_3
      if (id === 'S_COLLAGE_3' && current === 0 && newVal > 0) {
        setShowCollage3Modal(true);
        if (!collage3Option) setCollage3Option(COLLAGE_3_OPTIONS[0]);
      }
      if (id === 'S_COLLAGE_3' && newVal === 0) setCollage3Option('');

      return { ...prev, [id]: newVal };
    });
  };

  const toggleScreenshotProduct = (id: string) => {
    setScreenshotQuantities(prev => {
      const current = prev[id] || 0;
      const newVal = current > 0 ? 0 : 1;
      
      // Trigger modal for S_COLLAGE_2
      if (id === 'S_COLLAGE_2' && newVal === 1) {
        setShowCollage2Modal(true);
        if (!collage2Option) setCollage2Option(COLLAGE_2_OPTIONS[0]);
      }
      if (id === 'S_COLLAGE_2' && newVal === 0) setCollage2Option('');

      // Trigger modal for S_COLLAGE_3
      if (id === 'S_COLLAGE_3' && newVal === 1) {
        setShowCollage3Modal(true);
        if (!collage3Option) setCollage3Option(COLLAGE_3_OPTIONS[0]);
      }
      if (id === 'S_COLLAGE_3' && newVal === 0) setCollage3Option('');

      return { ...prev, [id]: newVal };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.clientName.trim() || !formData.contactInfo?.trim()) {
      setError("請填寫所有必填欄位 (您的暱稱、聯絡方式)");
      return;
    }

    if (totalPrice === 0) {
      setError("請至少選擇一種商品");
      return;
    }

    // Check if S_COLLAGE_2 is selected but option is missing
    if (screenshotQuantities['S_COLLAGE_2'] > 0 && !collage2Option) {
        setShowCollage2Modal(true);
        if (!collage2Option) setCollage2Option(COLLAGE_2_OPTIONS[0]);
        return;
    }

    // Check if S_COLLAGE_3 is selected but option is missing
    if (screenshotQuantities['S_COLLAGE_3'] > 0 && !collage3Option) {
        setShowCollage3Modal(true);
        if (!collage3Option) setCollage3Option(COLLAGE_3_OPTIONS[0]);
        return;
    }

    setIsSubmitting(true);
    try {
      const autoClientId = `REQ-${Date.now().toString().slice(-4)}`;
      let itemsList: string[] = [];

      if (isScreenshot) {
         SCREENSHOT_PRODUCTS.forEach(p => {
            const qty = screenshotQuantities[p.id] || 0;
            if (qty > 0) {
               let itemLine = `- ${p.label} x ${qty} ($${p.price * qty})`;
               // Append S_COLLAGE_2 Option
               if (p.id === 'S_COLLAGE_2' && collage2Option) {
                 itemLine += `\n   └── 外觀選項：${collage2Option}`;
               }
               // Append S_COLLAGE_3 Option
               if (p.id === 'S_COLLAGE_3' && collage3Option) {
                 itemLine += `\n   └── 外觀選項：${collage3Option}`;
               }
               itemsList.push(itemLine);
            }
         });
      } else {
         if (sandQuantities.CARD_BOX > 0) itemsList.push(`- 名片流麻（7x10cm） x ${sandQuantities.CARD_BOX} (單價$400)`);
         if (sandQuantities.CHARM_BOX > 0) itemsList.push(`- 吊飾流麻（4x7cm） x ${sandQuantities.CHARM_BOX} (單價$350)`);
         if (isCustom) itemsList.push('【加購】：客製化 (+$500)');
      }
      
      const itemsText = itemsList.join('\n');
      let finalDescription = `【選擇商品】：\n${itemsText}`;

      // Append Client Remark if exists
      if (clientRemark.trim()) {
        finalDescription += `\n\n【備註需求】：\n${clientRemark.trim()}`;
      }

      await onSubmit({
        ...formData,
        clientId: autoClientId,
        type: isScreenshot ? 'SCREENSHOT' : 'FLOWING_SAND', 
        status: 0,
        note: '申請審核中...',
        description: finalDescription,
        price: totalPrice
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError("發送失敗，請檢查網路連線。");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-[#E6DCC3] transform scale-100">
          <div className="w-16 h-16 bg-[#F2EFE9] text-[#BC4A3C] rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#5C4033] mb-2">申請已送出！</h3>
          <p className="text-[#8B5E3C] font-medium">請等待老師確認您的需求。<br/>您之後可以用暱稱查詢進度。</p>
        </div>
      </div>
    );
  }

  // --- COLLAGE 2 OPTION MODAL ---
  if (showCollage2Modal) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-[#E6DCC3] transform scale-100 animate-in zoom-in-95">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#F9F5F0] text-[#BC4A3C] rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#5C4033]">是否指定外觀？</h3>
            <p className="text-xs text-[#A67C52] mt-1">針對「2格出框拼貼」的外觀設定</p>
          </div>
          
          <div className="space-y-3 mb-6">
            {COLLAGE_2_OPTIONS.map((opt) => (
              <label 
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  collage2Option === opt 
                    ? 'border-[#BC4A3C] bg-[#FFF5F5]' 
                    : 'border-[#E6DCC3] bg-white hover:border-[#D6C0B3]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  collage2Option === opt ? 'border-[#BC4A3C]' : 'border-[#D6C0B3]'
                }`}>
                  {collage2Option === opt && <div className="w-2.5 h-2.5 bg-[#BC4A3C] rounded-full" />}
                </div>
                <span className={`text-sm font-bold ${collage2Option === opt ? 'text-[#BC4A3C]' : 'text-[#5C4033]'}`}>
                  {opt}
                </span>
                <input 
                  type="radio" 
                  name="collage2Option" 
                  value={opt} 
                  checked={collage2Option === opt} 
                  onChange={() => setCollage2Option(opt)}
                  className="hidden" 
                />
              </label>
            ))}

            {/* Note for Collage 2 */}
            <div className="p-3 bg-[#FFF5F5] border border-[#BC4A3C]/20 rounded-xl">
               <p className="text-xs text-[#BC4A3C] font-bold leading-relaxed">
                 * 出框外觀以同色系為主，沒有同色系建議穿同一件就好。
               </p>
            </div>
          </div>

          <button 
            onClick={() => setShowCollage2Modal(false)}
            className="w-full py-3 bg-[#BC4A3C] text-white rounded-xl font-bold shadow-lg shadow-[#BC4A3C]/20 active:scale-95 transition-all hover:bg-[#A33E32]"
          >
            確認選擇
          </button>
        </div>
      </div>
    );
  }

  // --- COLLAGE 3 OPTION MODAL ---
  if (showCollage3Modal) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-[#E6DCC3] transform scale-100 animate-in zoom-in-95">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#F9F5F0] text-[#BC4A3C] rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#5C4033]">是否指定外觀？</h3>
            <p className="text-xs text-[#A67C52] mt-1">針對「3格出框拼貼」的外觀設定</p>
          </div>
          
          <div className="space-y-3 mb-6">
            {COLLAGE_3_OPTIONS.map((opt) => (
              <label 
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  collage3Option === opt 
                    ? 'border-[#BC4A3C] bg-[#FFF5F5]' 
                    : 'border-[#E6DCC3] bg-white hover:border-[#D6C0B3]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  collage3Option === opt ? 'border-[#BC4A3C]' : 'border-[#D6C0B3]'
                }`}>
                  {collage3Option === opt && <div className="w-2.5 h-2.5 bg-[#BC4A3C] rounded-full" />}
                </div>
                <span className={`text-sm font-bold ${collage3Option === opt ? 'text-[#BC4A3C]' : 'text-[#5C4033]'}`}>
                  {opt}
                </span>
                <input 
                  type="radio" 
                  name="collage3Option" 
                  value={opt} 
                  checked={collage3Option === opt} 
                  onChange={() => setCollage3Option(opt)}
                  className="hidden" 
                />
              </label>
            ))}
            
            <div className="p-3 bg-[#FFF5F5] border border-[#BC4A3C]/20 rounded-xl">
               <p className="text-xs text-[#BC4A3C] font-bold leading-relaxed">
                 * 出框外觀以同色系為主，沒有同色系建議穿同一件就好。
               </p>
            </div>
          </div>

          <button 
            onClick={() => setShowCollage3Modal(false)}
            className="w-full py-3 bg-[#BC4A3C] text-white rounded-xl font-bold shadow-lg shadow-[#BC4A3C]/20 active:scale-95 transition-all hover:bg-[#A33E32]"
          >
            確認選擇
          </button>
        </div>
      </div>
    );
  }

  // --- GUIDELINES VIEW ---
  if (showGuidelines) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
          
          <div className="p-6 flex justify-between items-center shrink-0 bg-gradient-to-r from-[#F9F5F0] to-[#E6DCC3]">
            <div className="flex items-center gap-3">
              <div className="bg-white/60 p-2 rounded-xl shadow-sm">
                 <ScrollText className="text-[#A67C52]" size={20} />
              </div>
              <div>
                 <h3 className="font-bold text-lg text-[#5C4033]">
                   {isScreenshot ? '截圖委託須知' : '流麻委託須知'}
                 </h3>
                 <p className="text-[10px] text-[#A67C52] font-bold uppercase tracking-widest">Guidelines</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-[#A67C52]">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar text-[#5C4033] space-y-4 text-sm leading-relaxed">
             <div className="bg-[#F9F5F0] p-4 rounded-xl border border-[#E6DCC3]">
               <h4 className="font-bold text-[#BC4A3C] mb-2 flex items-center gap-2">
                 <AlertCircle size={16} /> 注意事項
               </h4>
               
               {isScreenshot ? (
                 // --- SCREENSHOT GUIDELINES ---
                 <ul className="list-decimal pl-5 space-y-3 marker:text-[#BC4A3C] marker:font-bold">
                   <li><strong>關於排單：</strong> 為了讓每個小可愛都能美美的拿到圖，店主很龜毛，出圖緩慢，可接受再排單。</li>
                   <li><strong>急單說明：</strong> 排不下去可以掛急單，或者是提前跟我說，初稿拍下去前都不算跑單。</li>
                   <li><strong>風格指定：</strong> 可指定風格外觀，沒有盲盒價，沒指定就是我挑。</li>
                   <li><strong>付款方式：</strong> 可金可T，幣值看社團當天最高幣值。</li>
                   <li><strong>修改次數：</strong> 截圖完成會先給初稿，構圖動作滿意才會進精修，可免費重截兩次。</li>
                   <li><strong>自備道具：</strong> 衣櫃比較空的寶寶們請在包包裡自備不同門派武器，雜貨店賣的就好。</li>
                   <li><strong>授權說明：</strong> 完成交易後會給雲端網址，原片和精修成片，請於一個月內下載完畢，原片可自行重製利用。成片默認可加水印放在作品集。</li>
                 </ul>
               ) : (
                 // --- FLOWING SAND GUIDELINES ---
                 <ul className="list-disc pl-5 space-y-3 marker:text-[#D6C0B3]">
                   <li><strong>委託順序：</strong> 排單→匯訂金20%→溝通指定外觀→確認圖面→圖面分層→做流麻本體→尾款與發貨</li>
                   <li><strong>工期說明：</strong> 流麻的材料與圖面都是排單後現訂現送印，含材料等待工期約10~40個工作天，不接急單。</li>
                   <li><strong>關於修改：</strong> 截圖後可確認構圖外觀是否滿意，可免費修改一次，圖面分層後可確認分層是否有誤，開始只做流麻後不做任何修改。</li>
                   <li><strong>拍攝注意事項：</strong> 請先設定好稱號、名片徽章及頭像，並由我方上號截圖及名片UI，開號前請換好指定外觀、臉型，需留出一格已解鎖的可替換名片做去背使用。</li>
                   <li><strong>手作痕跡：</strong> 流麻為全手工製作，難免會有細微氣泡、膠痕或手工痕跡，完美主義者請三思後再委託，除臉上明顯氣泡或者邊緣縮膠嚴重不接受退貨。</li>
                   <li><strong>退款政策：</strong> 圖面分層確定後不接受因個人因素取消或退款。</li>
                 </ul>
               )}
             </div>
             <p className="text-xs text-[#8B5E3C] text-center mt-4">
               為保障雙方權益，請務必詳閱以上內容。
             </p>
          </div>

          <div className="p-4 border-t border-[#E6DCC3] bg-white shrink-0 space-y-4">
            <button 
              onClick={() => setHasAgreed(!hasAgreed)}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#F9F5F0] transition-colors cursor-pointer group"
            >
              <div className={`transition-colors ${hasAgreed ? 'text-[#BC4A3C]' : 'text-[#D6C0B3] group-hover:text-[#A67C52]'}`}>
                {hasAgreed ? <CheckSquare size={24} /> : <Square size={24} />}
              </div>
              <span className="font-bold text-[#5C4033] text-sm">我已詳細閱讀並同意上述委託規範</span>
            </button>

            <div className="flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-bold text-[#D6C0B3] hover:bg-[#F9F5F0] transition-colors text-sm"
              >
                取消
              </button>
              <button 
                onClick={() => setShowGuidelines(false)}
                disabled={!hasAgreed}
                className="px-8 py-3 bg-[#BC4A3C] text-white rounded-xl font-bold shadow-lg shadow-[#BC4A3C]/20 transition-all active:scale-95 flex items-center gap-2 text-sm disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed hover:bg-[#A33E32]"
              >
                下一步
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FORM VIEW ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-center shrink-0 bg-gradient-to-r from-[#F9F5F0] to-[#E6DCC3]">
          <div className="flex items-center gap-3">
            <div className="bg-white/60 p-2 rounded-xl shadow-sm">
               <Package className="text-[#A67C52]" size={20} />
            </div>
            <div>
               <h3 className="font-bold text-lg text-[#5C4033]">
                 填寫委託申請
               </h3>
               <p className="text-[10px] text-[#A67C52] font-bold uppercase tracking-widest">
                 {isScreenshot ? 'Screenshot' : 'Flowing Sand'}
               </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-[#A67C52]">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl text-sm font-bold flex items-center gap-2 border border-red-100">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form id="request-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
               <label className="text-xs font-bold text-[#A67C52] block uppercase tracking-widest px-1">Step 1. 您的基本資料</label>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-bold text-[#A67C52] mb-1 block">您的暱稱 (查詢用)</label>
                    <input 
                      required
                      className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#BC4A3C] rounded-xl p-3 text-sm transition-all outline-none font-medium text-[#5C4033]"
                      placeholder="例如: 糰子"
                      value={formData.clientName}
                      onChange={e => setFormData({...formData, clientName: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-[#A67C52] mb-1 block">聯絡方式（line/FB/Discord）</label>
                    <input 
                      required
                      className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#BC4A3C] rounded-xl p-3 text-sm transition-all outline-none font-medium text-[#5C4033]"
                      placeholder="範例：Discord:shen_li"
                      value={formData.contactInfo}
                      onChange={e => setFormData({...formData, contactInfo: e.target.value})}
                    />
                 </div>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-xs font-bold text-[#A67C52] block uppercase tracking-widest px-1">Step 2. 選擇委託項目 (可複選)</label>
               
               {isScreenshot ? (
                 // --- SCREENSHOT PRODUCT LIST ---
                 <div className="space-y-3">
                    {SCREENSHOT_PRODUCTS.map(product => {
                      const qty = screenshotQuantities[product.id] || 0;
                      const isSelected = qty > 0;
                      
                      return (
                        <div
                          key={product.id}
                          onClick={() => toggleScreenshotProduct(product.id)}
                          className={`relative p-3 rounded-xl border-2 text-left transition-all group cursor-pointer select-none flex justify-between items-center ${
                            isSelected 
                              ? 'border-[#BC4A3C] bg-[#FFF5F5] shadow-sm' 
                              : 'border-[#E6DCC3] bg-white hover:border-[#D6C0B3]'
                          }`}
                        >
                           <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#BC4A3C] bg-[#BC4A3C]' : 'border-[#D6C0B3]'}`}>
                                {isSelected && <Check size={12} className="text-white" />}
                              </div>
                              <div className="flex flex-col">
                                <span className={`font-bold text-sm truncate ${isSelected ? 'text-[#BC4A3C]' : 'text-[#5C4033]'}`}>
                                  {product.label}
                                </span>
                                {product.sub && (
                                  <span className="text-[10px] text-[#A67C52]">{product.sub}</span>
                                )}
                                {/* Display Option Selection for S_COLLAGE_2 inline */}
                                {product.id === 'S_COLLAGE_2' && isSelected && collage2Option && (
                                   <span className="text-[10px] text-[#BC4A3C] font-bold mt-0.5">
                                      {collage2Option}
                                   </span>
                                )}
                                {/* Display Option Selection for S_COLLAGE_3 inline */}
                                {product.id === 'S_COLLAGE_3' && isSelected && collage3Option && (
                                   <span className="text-[10px] text-[#BC4A3C] font-bold mt-0.5">
                                      {collage3Option}
                                   </span>
                                )}
                              </div>
                           </div>

                           {isSelected ? (
                             <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-[#E6DCC3] shrink-0">
                               <button 
                                 type="button"
                                 onClick={(e) => { e.stopPropagation(); updateScreenshotQuantity(product.id, -1); }}
                                 className="w-6 h-6 flex items-center justify-center rounded-md bg-[#F2EFE9] text-[#5C4033] hover:bg-[#E6DCC3] active:scale-95 transition-all"
                               >
                                 <Minus size={14} />
                               </button>
                               <span className="text-sm font-bold text-[#BC4A3C] w-4 text-center">{qty}</span>
                               <button 
                                 type="button"
                                 onClick={(e) => { e.stopPropagation(); updateScreenshotQuantity(product.id, 1); }}
                                 className="w-6 h-6 flex items-center justify-center rounded-md bg-[#BC4A3C] text-white hover:bg-[#A33E32] active:scale-95 transition-all"
                               >
                                 <Plus size={14} />
                               </button>
                            </div>
                           ) : (
                             <span className="font-bold text-[#D6C0B3] text-sm group-hover:text-[#BC4A3C] transition-colors shrink-0">
                               ${product.price}
                             </span>
                           )}
                        </div>
                      );
                    })}
                 </div>
               ) : (
                 // --- FLOWING SAND PRODUCT LIST ---
                 <div className="grid grid-cols-1 gap-3">
                   {/* Product 1: Card Blind Box */}
                   <div
                      onClick={() => toggleSandProduct('CARD_BOX')}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all group overflow-hidden cursor-pointer select-none ${
                        sandQuantities.CARD_BOX > 0 
                          ? 'border-[#BC4A3C] bg-[#FFF5F5] shadow-md shadow-[#BC4A3C]/10' 
                          : 'border-[#E6DCC3] bg-white hover:border-[#D6C0B3]'
                      }`}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${sandQuantities.CARD_BOX > 0 ? 'border-[#BC4A3C] bg-[#BC4A3C]' : 'border-[#D6C0B3]'}`}>
                            {sandQuantities.CARD_BOX > 0 && <Check size={12} className="text-white" />}
                          </div>
                          <div>
                            <span className={`block font-bold text-sm ${sandQuantities.CARD_BOX > 0 ? 'text-[#BC4A3C]' : 'text-[#5C4033]'}`}>
                              名片流麻（7x10cm）
                            </span>
                          </div>
                        </div>
                        
                        {sandQuantities.CARD_BOX > 0 ? (
                          <div className="flex items-center gap-3 bg-white rounded-lg p-1 shadow-sm border border-[#E6DCC3]">
                             <button 
                               type="button"
                               onClick={(e) => { e.stopPropagation(); updateSandQuantity('CARD_BOX', -1); }}
                               className="w-6 h-6 flex items-center justify-center rounded-md bg-[#F2EFE9] text-[#5C4033] hover:bg-[#E6DCC3] active:scale-95 transition-all"
                             >
                               <Minus size={14} />
                             </button>
                             <span className="text-sm font-bold text-[#BC4A3C] w-4 text-center">{sandQuantities.CARD_BOX}</span>
                             <button 
                               type="button"
                               onClick={(e) => { e.stopPropagation(); updateSandQuantity('CARD_BOX', 1); }}
                               className="w-6 h-6 flex items-center justify-center rounded-md bg-[#BC4A3C] text-white hover:bg-[#A33E32] active:scale-95 transition-all"
                             >
                               <Plus size={14} />
                             </button>
                          </div>
                        ) : (
                          <span className="font-bold text-[#D6C0B3] text-sm group-hover:text-[#BC4A3C] transition-colors">400元</span>
                        )}
                      </div>
                   </div>

                   {/* Product 2: Charm Blind Box */}
                   <div
                      onClick={() => toggleSandProduct('CHARM_BOX')}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all group overflow-hidden cursor-pointer select-none ${
                        sandQuantities.CHARM_BOX > 0 
                          ? 'border-[#BC4A3C] bg-[#FFF5F5] shadow-md shadow-[#BC4A3C]/10' 
                          : 'border-[#E6DCC3] bg-white hover:border-[#D6C0B3]'
                      }`}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${sandQuantities.CHARM_BOX > 0 ? 'border-[#BC4A3C] bg-[#BC4A3C]' : 'border-[#D6C0B3]'}`}>
                            {sandQuantities.CHARM_BOX > 0 && <Check size={12} className="text-white" />}
                          </div>
                          <div>
                            <span className={`block font-bold text-sm ${sandQuantities.CHARM_BOX > 0 ? 'text-[#BC4A3C]' : 'text-[#5C4033]'}`}>
                              吊飾流麻（4x7cm）
                            </span>
                          </div>
                        </div>
                        
                        {sandQuantities.CHARM_BOX > 0 ? (
                           <div className="flex items-center gap-3 bg-white rounded-lg p-1 shadow-sm border border-[#E6DCC3]">
                             <button 
                               type="button"
                               onClick={(e) => { e.stopPropagation(); updateSandQuantity('CHARM_BOX', -1); }}
                               className="w-6 h-6 flex items-center justify-center rounded-md bg-[#F2EFE9] text-[#5C4033] hover:bg-[#E6DCC3] active:scale-95 transition-all"
                             >
                               <Minus size={14} />
                             </button>
                             <span className="text-sm font-bold text-[#BC4A3C] w-4 text-center">{sandQuantities.CHARM_BOX}</span>
                             <button 
                               type="button"
                               onClick={(e) => { e.stopPropagation(); updateSandQuantity('CHARM_BOX', 1); }}
                               className="w-6 h-6 flex items-center justify-center rounded-md bg-[#BC4A3C] text-white hover:bg-[#A33E32] active:scale-95 transition-all"
                             >
                               <Plus size={14} />
                             </button>
                          </div>
                        ) : (
                          <span className="font-bold text-[#D6C0B3] text-sm group-hover:text-[#BC4A3C] transition-colors">350元</span>
                        )}
                      </div>
                   </div>

                    {/* Custom Add-on Checkbox (Flowing Sand Only) */}
                   <label 
                     className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                       isCustom ? 'border-[#A67C52] bg-[#F9F5F0]' : 'border-dashed border-[#E6DCC3] bg-white hover:bg-[#F9F5F0]'
                     }`}
                   >
                      <div className="flex items-center gap-3">
                        <div className={`transition-colors ${isCustom ? 'text-[#A67C52]' : 'text-[#D6C0B3]'}`}>
                          {isCustom ? <CheckSquare size={20} /> : <Square size={20} />}
                        </div>
                        <span className={`font-bold text-sm ${isCustom ? 'text-[#5C4033]' : 'text-[#A67C52]'}`}>
                          客製化
                        </span>
                      </div>
                      <span className={`font-bold text-sm ${isCustom ? 'text-[#A67C52]' : 'text-[#D6C0B3]'}`}>
                        +500元
                      </span>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isCustom}
                        onChange={() => setIsCustom(!isCustom)}
                      />
                   </label>
                 </div>
               )}
               
               {/* NEW: Screenshot Remark Field */}
               {isScreenshot && (
                 <div className="mt-4">
                    <label className="text-[10px] font-bold text-[#A67C52] mb-1 block flex items-center gap-1">
                      <MessageSquare size={12} />
                      想說的話 (許願色系、風格、備註...)
                    </label>
                    <textarea 
                      className="w-full border-2 border-[#E6DCC3] bg-[#F9F5F0] focus:bg-white focus:border-[#BC4A3C] rounded-xl p-3 text-sm transition-all outline-none font-medium text-[#5C4033] placeholder:text-[#D6C0B3] min-h-[80px]"
                      placeholder="範例：許願色系、風格、備註……"
                      value={clientRemark}
                      onChange={e => setClientRemark(e.target.value)}
                    />
                 </div>
               )}

               <div className="mt-4 bg-[#F9F5F0] p-4 rounded-xl border border-[#E6DCC3]">
                  <label className="text-[10px] font-bold text-[#A67C52] mb-2 block flex items-center gap-1">
                    <AlertCircle size={12} />
                    備註
                  </label>
                  <p className="text-sm text-[#5C4033] font-medium leading-relaxed">
                    {isScreenshot 
                       ? "更多展示請看作品集，填單完成請私訊提醒我。" 
                       : "流麻均為盲盒款，顏色、材料、流蘇顏色與款式皆無法指定，依我方搭配為主。如需指定請客製。\n填單完成請私訊提醒我。"
                    }
                  </p>
               </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6DCC3] bg-white flex justify-between items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#A67C52] uppercase tracking-widest flex items-center gap-1">
              <Coins size={12} /> 總金額
            </span>
            <span className="text-xl font-bold text-[#BC4A3C] leading-none">${totalPrice}</span>
          </div>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl font-bold text-[#D6C0B3] hover:bg-[#F9F5F0] transition-colors text-sm"
            >
              取消
            </button>
            <button 
              type="submit"
              form="request-form"
              disabled={isSubmitting}
              className="px-6 py-3 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 text-sm disabled:opacity-70 bg-[#BC4A3C] hover:bg-[#A33E32] shadow-[#BC4A3C]/20"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              送出
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RequestForm;