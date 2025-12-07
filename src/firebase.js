// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
  collection,
  addDoc
} from "firebase/firestore";

// === CONFIG FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyA8OOzjSyKlNX-1OT8cSyus6PIe_bpZ52o",
  authDomain: "qrcog-app.firebaseapp.com",
  projectId: "qrcog-app",
  storageBucket: "qrcog-app.firebasestorage.app",
  messagingSenderId: "238439173092",
  appId: "1:238439173092:web:8d2ebad8673c69f48d55f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// === admin list ===
export const ADMIN_EMAILS = [
  "almarot@ensc.fr",
  "prof@ensc.fr"
];

export let loginApproved = false;
export let isAdmin = false;

// === LOGIN AVEC FILTRE ENSC ===
export async function loginWithGoogle() {
  loginApproved = false;
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Check ENSC email
  if (!user.email.endsWith("@ensc.fr")) {
    await signOut(auth);
    const err = new Error("Email non autorisé");
    err.code = "auth/not-ensc";
    throw err;
  }

  // Check admin
  isAdmin = ADMIN_EMAILS.includes(user.email);

  loginApproved = true;
  return user;
}

export const logout = () => signOut(auth);

// === CREATE STUDENT ===
export async function createStudentIfNotExists(user) {
  const ref = doc(db, "students", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName,
      email: user.email,
      createdAt: serverTimestamp(),
      totalPoints: 0
    });
  } else {
    await setDoc(ref, {
      name: user.displayName,
      email: user.email
    }, { merge: true });
  }
}

// === ADD POINTS ===
export async function addPoints(userId, amount, reason, sessionId = null) {
  await addDoc(collection(db, "points"), {
    userId,
    amount,
    reason,
    sessionId,
    timestamp: serverTimestamp(),
  });

  await updateDoc(doc(db, "students", userId), {
    totalPoints: increment(amount),
  });
}
