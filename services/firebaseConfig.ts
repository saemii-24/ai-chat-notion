
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * [필수] Firebase 콘솔(https://console.firebase.google.com/)에서 
 * 프로젝트를 생성한 후 아래의 설정값을 본인의 것으로 교체하세요.
 */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 사용자가 설정을 변경했는지 확인하는 플래그
export const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

// 설정이 되어 있을 때만 초기화 진행
let app: any = null;
if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

// 서비스 내보내기 (설정 전에는 null)
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
