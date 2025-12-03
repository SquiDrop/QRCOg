import { useEffect, useState } from "react";
import { auth, logout } from "./firebase";
import { createStudentIfNotExists } from "./firebase";
import Login from "./pages/Login";
import Scan from "./pages/Scan";
import AdminCreateSession from "./pages/AdminCreateSession";

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("home"); 
  // modes possibles : "home", "scan", "admin"

  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  useEffect(() => {
    if (user) {
      createStudentIfNotExists(user);
    }
  }, [user]);

  if (!user) return <Login />;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenue {user.displayName} 👋</h1>
      <p>{user.email}</p>

      {/* Boutons du haut */}
      <div style={{ marginBottom: "20px" }}>
        {/* Scanner */}
        <button
          onClick={() => setMode("scan")}
          style={{ padding: "10px 20px", marginRight: "15px" }}
        >
          Scanner un QR
        </button>

        {/* Admin */}
        <button
          onClick={() => setMode("admin")}
          style={{ padding: "10px 20px", marginRight: "15px" }}
        >
          Mode Admin
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
    </div>
  );
}

export default App;
