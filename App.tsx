import React, { useState, useEffect } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { ClipboardList, WifiOff, Lock } from 'lucide-react';
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
    if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
      return 'admin';
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
      if (window.location.pathname === '/admin') {
        setView('admin');
      } else {
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
        if (!u && !isDemoMode) {
            // If we lose auth unexpectedly, we might want to consider demo mode, 
            // but usually we just wait for reconnection.
        }
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
      // Optional: Fallback to demo mode on permission denied or connection loss?
      // setIsDemoMode(true);
    });

    return () => unsubscribe();
  }, [user, isDemoMode]);

  // Helper to sync local state to storage in Demo Mode
  const syncLocal = (newData: Commission[]) => {
    setCommissions(newData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
  };

  // --- Actions ---
  
  // Switch to Admin View
  const handleSwitchToAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', '/admin');
    setView('admin');
  };

  // Switch to Client View (Logout)
  const handleAdminLogout = () => {
    setCurrentAdmin(null);
    window.history.pushState({}, '', '/');
    setView('client');
  };

  const handleAddCommission = async (data: CommissionFormData) => {
    if (!data.clientId || !currentAdmin) throw new Error("缺少必要資訊");
    
    // Create a composite unique ID to allow multiple teachers to use the same "clientId" (e.g. 001)
    // without overwriting each other's data.
    const uniqueDocId = `${currentAdmin.ownerId}_${data.clientId}`;

    const newCommission: Commission = {
      ...data,
      id: uniqueDocId, 
      ownerId: currentAdmin.ownerId,
      ownerName: currentAdmin.name,
      updatedAt: Date.now()
    };

    if (isDemoMode) {
      // Check for duplicates in local mode (based on uniqueDocId)
      const newData = [...commissions.filter(c => c.id !== uniqueDocId), newCommission];
      syncLocal(newData);
      await new Promise(r => setTimeout(r, 500)); // Fake network delay
      return;
    }
    
    // Real Firebase Logic
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
    if (confirm('確定要刪除這筆委託嗎？')) {
      if (isDemoMode) {
        const newData = commissions.filter(c => c.id !== id);
        syncLocal(newData);
        return;
      }

      try {
        await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'commissions', id));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F9] text-gray-800 font-sans p-4 md:p-8">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-orange-100 text-orange-700 px-4 py-2 text-center text-xs font-bold tracking-wider fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2">
          <WifiOff size={14} />
          <span>示範模式 (資料僅儲存於本機)</span>
        </div>
      )}

      {/* Header */}
      <nav className={`max-w-4xl mx-auto flex justify-center items-center mb-12 ${isDemoMode ? 'mt-8' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-500 shadow-sm shadow-rose-50">
            <ClipboardList size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">委託進度追蹤</h1>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto pb-20">
        {view === 'client' ? (
          <ClientView commissions={commissions} />
        ) : (
          <>
            {!currentAdmin ? (
              <AdminLogin onLogin={setCurrentAdmin} />
            ) : (
              <AdminDashboard 
                currentAdmin={currentAdmin}
                commissions={commissions}
                onLogout={handleAdminLogout}
                onAdd={handleAddCommission}
                onDelete={handleDelete}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </>
        )}
      </main>

      <footer className="max-w-4xl mx-auto mt-16 text-center text-rose-300 text-[10px] font-bold tracking-[0.2em] uppercase pb-10">
        <p>© 2026 委託進度追蹤系統</p>
        <div className="mt-2 opacity-50 flex justify-center items-center gap-2">
            <span>POWERED BY REACT & {isDemoMode ? 'LOCAL STORAGE' : 'FIREBASE'}</span>
            {view === 'client' && (
              <a 
                href="/admin" 
                onClick={handleSwitchToAdmin}
                className="hover:text-rose-500 transition-colors cursor-pointer ml-2"
                title="老師後台"
              >
                <Lock size={10} />
              </a>
            )}
        </div>
      </footer>
    </div>
  );
}