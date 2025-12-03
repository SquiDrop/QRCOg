// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";

// === FIRESTORE IMPORT (unique et complet) ===
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

// Méthodes de login / logout
export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

// Gestion étudiant : création si inexistant

export async function createStudentIfNotExists(user) {
  const ref = doc(db, "students", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // L'étudiant n'existe pas → on le crée
    await setDoc(ref, {
      name: user.displayName,
      email: user.email,
      createdAt: serverTimestamp(),
      totalPoints: 0
    });
  } else {
    // L'étudiant existe → on met à jour uniquement name/email
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
  // 1) Ajouter l’historique de points
  await addDoc(collection(db, "points"), {
    userId,
    amount,
    reason,
    sessionId,
    timestamp: serverTimestamp(),
  });

  // 2) Incrémenter le total dans students
  const studentRef = doc(db, "students", userId);

  await updateDoc(studentRef, {
    totalPoints: increment(amount),
  });
}
