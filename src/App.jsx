import { useEffect, useState } from "react";
import { auth, logout } from "./firebase";
import { createStudentIfNotExists } from "./firebase";
import Login from "./pages/Login";
import Scan from "./pages/Scan";
import AdminCreateSession from "./pages/AdminCreateSession";
import AdminDashboard from "./pages/AdminDashboard";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [mode, setMode] = useState("home");
  // modes possibles : "home", "scan", "admin"

  // 1️⃣ On écoute l'état d'auth
  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  // 2️⃣ On crée l'élève s'il n'existe pas déjà
  useEffect(() => {
    if (user) {
      createStudentIfNotExists(user);
    }
  }, [user]);

  // 3️⃣ On écoute EN TEMPS RÉEL les points de l'étudiant dans Firestore
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "students", user.uid);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setPoints(snap.data().totalPoints || 0);
      }
    });

    return () => unsub();
  }, [user]);

  if (!user) return <Login />;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenue {user.displayName} 👋</h1>
      <p>{user.email}</p>

      {/* Affichage des points */}
      <p style={{ fontSize: "20px", fontWeight: "bold" }}>
        Points totaux : {points} ⭐
      </p>

      {/* Boutons du haut */}
      <div style={{ marginBottom: "20px" }}>
        {/* Scanner */}
        <button
          onClick={() => setMode("scan")}
          style={{ padding: "10px 20px", marginRight: "15px" }}
        >
          Scanner un QR
        </button>

        {/* Mode Admin : création QR */}
        <button
          onClick={() => setMode("admin")}
          style={{ padding: "10px 20px", marginRight: "15px" }}
        >
          Mode Admin
        </button>

        {/* Tableau de bord */}
        <button
          onClick={() => setMode("dashboard")}
          style={{ padding: "10px 20px", marginRight: "15px" }}
        >
          Tableau de bord
        </button>

        {/* Déconnexion */}
        <button
          onClick={logout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#e74c3c",
            color: "white",
          }}
        >
          Se déconnecter
        </button>
      </div>


      {/* Pages */}
      {mode === "scan" && (
        <div style={{ marginTop: "30px" }}>
          <Scan />
        </div>
      )}

      {mode === "admin" && (
        <div style={{ marginTop: "30px" }}>
          <AdminCreateSession />
        </div>
      )}

      {mode === "dashboard" && (
        <div style={{ marginTop: "30px" }}>
          <AdminDashboard />
        </div>
      )}

    </div>
  );
}

export default App;
