import React, { useState, useEffect } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { WifiOff, Lock } from 'lucide-react';
import { auth, db, isMockConfig } from './services/firebase';
import { APP_ID } from './constants';
import { Commission, AdminUser, CommissionFormData } from './types';
import ClientView from './components/ClientView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

const LOCAL_STORAGE_KEY = `commission_tracker_${APP_ID}_data`;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  
  // Determine initial view based on URL path
  const [view, setView] = useState<'client' | 'admin'>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
        return 'admin';
      }
    } catch (e) {
      // Ignore security errors when accessing location
    }
    return 'client';
  });

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(isMockConfig);
  
  // Admin Authentication State
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  // --- Handle Browser Navigation (Back/Forward) ---
  useEffect(() => {
    const handlePopState = () => {
      try {
        if (window.location.pathname === '/admin') {
          setView('admin');
        } else {
          setView('client');
        }
      } catch (e) {
        setView('client');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- Initialize Firebase Auth ---
  useEffect(() => {
    const initAuth = async () => {
      if (isDemoMode) return; // Skip auth in demo mode

      try {
        const initialToken = (typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : (typeof window !== 'undefined' ? window.__initial_auth_token : undefined));
        
        if (initialToken) {
          await signInWithCustomToken(auth, initialToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.warn("Auth init failed, switching to Demo Mode:", error);
        setIsDemoMode(true);
      }
    };
    initAuth();
    
    if (!isDemoMode) {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
      });
      return () => unsubscribe();
    }
  }, [isDemoMode]);

  // --- Data Sync (Firebase or LocalStorage) ---
  useEffect(() => {
    if (isDemoMode) {
      // Load from LocalStorage
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setCommissions(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load local data", e);
      }
      return;
    }

    if (!user) return;

    // Firebase Sync
    const q = collection(db, 'artifacts', APP_ID, 'public', 'data', 'commissions');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Commission));
      setCommissions(data);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, [user, isDemoMode]);

  // Helper to sync local state to storage in Demo Mode
  const syncLocal = (newData: Commission[]) => {
    setCommissions(newData);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.warn("LocalStorage write failed (security restriction):", e);
    }
  };

  // Helper for safe navigation
  const safePushState = (path: string) => {
    try {
      window.history.pushState({}, '', path);
    } catch (e) {
      console.warn("History pushState failed (security restriction):", e);
    }
  };

  // --- Actions ---
  
  // Switch to Admin View
  const handleSwitchToAdmin = () => {
    safePushState('/admin');
    setView('admin');
  };

  const handleAdminLoginSuccess = (admin: AdminUser) => {
    console.log("Admin logged in successfully:", admin);
    // 1. Set admin data
    setCurrentAdmin(admin);
    // 2. Force view to admin (in case it wasn't for some reason)
    setView('admin'); 
    // 3. Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to Client View (Logout)
  const handleAdminLogout = () => {
    setCurrentAdmin(null);
    safePushState('/');
    setView('client');
  };

  const handleAddCommission = async (data: CommissionFormData) => {
    const targetOwnerId = currentAdmin?.ownerId || data.ownerId;
    
    // Automatically determine teacher name if not logged in as admin
    let targetOwnerName = currentAdmin?.name;
    if (!targetOwnerName) {
      // If submitting from client form, decide name based on type
      targetOwnerName = data.type === 'FLOWING_SAND' ? '蘇沐' : '沈梨';
    }

    if (!data.clientId || !targetOwnerId) throw new Error("缺少必要資訊");
    
    const uniqueDocId = `${targetOwnerId}_${data.clientId}`;

    const newCommission: Commission = {
      ...data,
      clientId: data.clientId,
      id: uniqueDocId, 
      ownerId: targetOwnerId,
      ownerName: targetOwnerName,
      updatedAt: Date.now(),
      createdAt: Date.now()
    };

    if (isDemoMode) {
      const newData = [...commissions.filter(c => c.id !== uniqueDocId), newCommission];
      syncLocal(newData);
      await new Promise(r => setTimeout(r, 500));
      return;
    }
    
    if (!auth.currentUser) {
       try { await signInAnonymously(auth); } catch(e) { 
         throw new Error("無法連接至資料庫，請刷新頁面或檢查網路");
       }
    }

    try {
      await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'commissions', uniqueDocId), newCommission);
    } catch (err) {
      console.error("Add failed", err);
      throw err;
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: number) => {
    if (isDemoMode) {
      const newData = commissions.map(c => c.id === id ? { ...c, status: newStatus, updatedAt: Date.now() } : c);
      syncLocal(newData);
      return;
    }

    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'commissions', id), {
        status: newStatus,
        updatedAt: Date.now()
      });
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDelete = async (id: string) => {
    console.log("Attempting to delete commission ID:", id); // Debug log

    if (!id) {
      alert("錯誤：無效的委託 ID");
      return;
    }

    if (!window.confirm('確定要刪除這筆委託嗎？此動作無法復原。')) return;

    if (isDemoMode) {
      const newData = commissions.filter(c => c.id !== id);
      syncLocal(newData);
      return;
    }

    try {
      // Ensure auth exists before write operation
      if (!auth.currentUser) {
        console.log("No user, attempting anonymous login...");
        await signInAnonymously(auth);
      }
      
      console.log("Deleting document from Firestore...");
      await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'commissions', id));
      console.log("Delete successful");
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(`刪除失敗：${err.message || "請檢查網路連線或重新登入後再試"}`);
    }
  };

  // --- Render Logic ---
  const renderMainContent = () => {
    if (view === 'client') {
      return (
        <ClientView 
          commissions={commissions} 
          onRequestSubmit={handleAddCommission}
        />
      );
    }

    // Admin View Logic
    // If currentAdmin is null, show login
    if (!currentAdmin) {
      return <AdminLogin onLogin={handleAdminLoginSuccess} />;
    }

    // If currentAdmin is set, show dashboard
    return (
      <AdminDashboard 
        key={currentAdmin.ownerId} // Force remount if admin changes
        currentAdmin={currentAdmin}
        commissions={commissions}
        onLogout={handleAdminLogout}
        onAdd={handleAddCommission}
        onDelete={handleDelete}
        onUpdateStatus={handleUpdateStatus}
      />
    );
  };

  return (
    // Changed bg-[#FFF9F9] to bg-[#F9F5F0] (Warm Vintage Cream)
    // Changed text-gray-800 to text-[#5C4033] (Dark Coffee)
    <div className="min-h-screen bg-[#F9F5F0] text-[#5C4033] font-sans p-4 md:p-8">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-[#A67C52] text-white px-4 py-2 text-center text-xs font-bold tracking-wider fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 shadow-md">
          <WifiOff size={14} />
          <span>示範模式 (資料僅儲存於本機)</span>
        </div>
      )}

      <main className={`max-w-2xl mx-auto pb-20 ${isDemoMode ? 'pt-12' : 'pt-4'}`}>
        {renderMainContent()}
      </main>

      <footer className="max-w-4xl mx-auto mt-16 text-center text-[#A67C52]/60 pb-10">
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase">
          <p>© 2026 委託進度追蹤系統</p>
          <div className="mt-2 flex justify-center items-center gap-2">
              <span>POWERED BY REACT & {isDemoMode ? 'LOCAL STORAGE' : 'FIREBASE'}</span>
          </div>
        </div>
        
        {view === 'client' && (
          <div className="mt-8 border-t border-[#D6C0B3]/50 pt-4 flex justify-center">
            <button 
              onClick={handleSwitchToAdmin}
              className="group flex items-center gap-1.5 p-3 rounded-full hover:bg-[#F2EFE9] transition-all cursor-pointer"
              title="前往後台"
            >
              <Lock size={12} className="text-[#D6C0B3] group-hover:text-[#A67C52] transition-colors" />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}