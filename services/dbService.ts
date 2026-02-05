import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { getAuthInstance, getDb } from "./firebaseConfig";
import { ChatSession } from "../types";

export interface User {
  id: string;
  email: string;
  name: string;
}

export class CloudDBService {
  static async login(email: string, password: string): Promise<User> {
    const authInst = getAuthInstance();
    if (!authInst)
      throw new Error(
        "Firebase Auth가 초기화되지 않았습니다. 설정을 확인하세요.",
      );

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(
          authInst,
          email,
          password,
        );
      } catch (err: any) {
        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-credential"
        ) {
          userCredential = await createUserWithEmailAndPassword(
            authInst,
            email,
            password,
          );
        } else {
          throw err;
        }
      }

      const firebaseUser = userCredential.user;
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.email!.split("@")[0],
      };
    } catch (error) {
      console.error("Firebase Auth Error:", error);
      throw error;
    }
  }

  static async loginWithGoogle(): Promise<User> {
    const authInst = getAuthInstance();
    if (!authInst)
      throw new Error(
        "Firebase Auth가 초기화되지 않았습니다. 설정을 확인하세요.",
      );

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(authInst, provider);
      const firebaseUser = result.user;
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || firebaseUser.email!.split("@")[0],
      };
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  }

  static async register(email: string, password: string): Promise<User> {
    const authInst = getAuthInstance();
    if (!authInst)
      throw new Error(
        "Firebase Auth가 초기화되지 않았습니다. 설정을 확인하세요.",
      );

    try {
      const userCredential = await createUserWithEmailAndPassword(
        authInst,
        email,
        password,
      );
      const firebaseUser = userCredential.user;
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.email!.split("@")[0],
      };
    } catch (err: any) {
      // If the email is already in use, try signing in instead (log the user in)
      if (err?.code === "auth/email-already-in-use") {
        try {
          const signInCred = await signInWithEmailAndPassword(
            authInst,
            email,
            password,
          );
          const firebaseUser = signInCred.user;
          return {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.email!.split("@")[0],
          };
        } catch (signInErr) {
          console.error("Register fallback sign-in failed:", signInErr);
          throw signInErr;
        }
      }

      console.error("Register Error:", err);
      throw err;
    }
  }

  static async logout() {
    const authInst = getAuthInstance();
    if (authInst) await signOut(authInst);
  }

  static onAuthChange(callback: (user: User | null) => void) {
    const authInst = getAuthInstance();
    if (!authInst) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(authInst, (firebaseUser) => {
      if (firebaseUser) {
        callback({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.email!.split("@")[0],
        });
      } else {
        callback(null);
      }
    });
  }

  // --- 데이터 관련 (Firestore) ---
  static async saveSession(userId: string, session: ChatSession) {
    const firestore = getDb();
    if (!firestore) return false;
    const sessionRef = doc(firestore, "users", userId, "sessions", session.id);
    await setDoc(sessionRef, {
      ...session,
      lastUpdated: Timestamp.now(),
    });
    return true;
  }

  static async getAllSessions(userId: string): Promise<ChatSession[]> {
    const firestore = getDb();
    if (!firestore) return [];
    const sessionsRef = collection(firestore, "users", userId, "sessions");
    const q = query(sessionsRef, orderBy("lastUpdated", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        lastUpdated: data.lastUpdated.toMillis
          ? data.lastUpdated.toMillis()
          : data.lastUpdated,
      } as ChatSession;
    });
  }

  static async deleteSession(userId: string, sessionId: string) {
    const firestore = getDb();
    if (!firestore) return;
    const sessionRef = doc(firestore, "users", userId, "sessions", sessionId);
    await deleteDoc(sessionRef);
  }
}
