import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// 設定步驟：
// 1. 到 https://console.firebase.google.com/ 建立新專案
// 2. 在專案設定中新增 Web App，複製 firebaseConfig 物件
// 3. 將複製的內容貼在下方 firebaseConfig 變數中
// 4. 到 Firebase Console -> Build -> Firestore Database -> Create Database (選擇 Production mode)
// 5. 到 Firebase Console -> Build -> Authentication -> Get Started -> 啟用 Anonymous (匿名登入)
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyAgfzJAlhGowci25Q4ELjPbb_yz9b1SgKE",
  authDomain: "commission-tracker-e6da0.firebaseapp.com",
  projectId: "commission-tracker-e6da0",
  storageBucket: "commission-tracker-e6da0.firebasestorage.app",
  messagingSenderId: "859578190938",
  appId: "1:859578190938:web:cb6274fb81816183501c63",
  measurementId: "G-2GGNJ16VZK"
};

// ------------------------------------------------------------------

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let isMockConfig = false;

const getConfig = () => {
  // 1. First priority: Use the hardcoded config if the user has updated it
  // Check if the user has replaced the dummy 'projectId' with a real one
  if (firebaseConfig.projectId !== "dummy-project") {
    return firebaseConfig;
  }

  // 2. Second priority: Injected globals (for specific dev environments)
  try {
    const globalScope = typeof globalThis !== 'undefined' ? globalThis : 
                        typeof window !== 'undefined' ? window : 
                        typeof self !== 'undefined' ? self : {};

    const globalConfig = (globalScope as any).__firebase_config;
    if (globalConfig) {
      return typeof globalConfig === 'string' ? JSON.parse(globalConfig) : globalConfig;
    } 

    if (typeof window !== 'undefined' && window.__firebase_config) {
      return typeof window.__firebase_config === 'string' ? JSON.parse(window.__firebase_config) : window.__firebase_config;
    }
  } catch (e) {
    console.warn("Error parsing injected firebase config:", e);
  }

  // 3. Fallback: Use the dummy config and enable Mock Mode
  console.warn("No valid Firebase config found. Using Mock/Demo mode.");
  isMockConfig = true;
  return firebaseConfig;
};

try {
  const config = getConfig();
  app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Last resort fallback
  app = initializeApp(firebaseConfig, 'fallback');
  auth = getAuth(app);
  db = getFirestore(app);
  isMockConfig = true;
}

export { app, auth, db, isMockConfig };