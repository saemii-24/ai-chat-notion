
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  query, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { ChatSession } from "../types";

export interface User {
  id: string;
  email: string;
  name: string;
}

export class CloudDBService {
  // --- 인증 관련 ---
  static async login(email: string, password: string): Promise<User> {
    if (!auth) throw new Error("Firebase Auth가 초기화되지 않았습니다. 설정을 확인하세요.");
    
    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw err;
        }
      }
      
      const firebaseUser = userCredential.user;
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.email!.split('@')[0]
      };
    } catch (error) {
      console.error("Firebase Auth Error:", error);
      throw error;
    }
  }

  static async logout() {
    if (auth) await signOut(auth);
  }

  static onAuthChange(callback: (user: User | null) => void) {
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.email!.split('@')[0]
        });
      } else {
        callback(null);
      }
    });
  }

  // --- 데이터 관련 (Firestore) ---
  static async saveSession(userId: string, session: ChatSession) {
    if (!db) return false;
    const sessionRef = doc(db, "users", userId, "sessions", session.id);
    await setDoc(sessionRef, {
      ...session,
      lastUpdated: Timestamp.now()
    });
    return true;
  }

  static async getAllSessions(userId: string): Promise<ChatSession[]> {
    if (!db) return [];
    const sessionsRef = collection(db, "users", userId, "sessions");
    const q = query(sessionsRef, orderBy("lastUpdated", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        lastUpdated: data.lastUpdated.toMillis ? data.lastUpdated.toMillis() : data.lastUpdated
      } as ChatSession;
    });
  }

  static async deleteSession(userId: string, sessionId: string) {
    if (!db) return;
    const sessionRef = doc(db, "users", userId, "sessions", sessionId);
    await deleteDoc(sessionRef);
  }
}
