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

const firebaseConfig = {
  apiKey: "AIzaSyA8OOzjSyKlNX-1OT8cSyus6PIe_bpZ52o",
  authDomain: "qrcog-app.firebaseapp.com",
  projectId: "qrcog-app",
  storageBucket: "qrcog-app.firebasestorage.app",
  messagingSenderId: "238439173092",
  appId: "1:238439173092:web:8d2ebad8673c69f48d55f1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// LISTE ADMIN
export const ADMIN_EMAILS = [
  "tonmail@ensc.fr"
];

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Filtre ENSC
  if (!user.email.endsWith("@ensc.fr")) {
    await signOut(auth);
    const error = new Error("Email non autorisé");
    error.code = "auth/not-ensc";
    throw error;
  }

  // Admin ?
  user.isAdmin = ADMIN_EMAILS.includes(user.email);

  return user;
}

export const logout = () => signOut(auth);

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
    await setDoc(
      ref,
      {
        name: user.displayName,
        email: user.email
      },
      { merge: true }
    );
  }
}

export async function addPoints(userId, amount, reason, sessionId = null) {
  await addDoc(collection(db, "points"), {
    userId,
    amount,
    reason,
    sessionId,
    timestamp: serverTimestamp(),
  });

  const studentRef = doc(db, "students", userId);

  await updateDoc(studentRef, {
    totalPoints: increment(amount),
  });
}
