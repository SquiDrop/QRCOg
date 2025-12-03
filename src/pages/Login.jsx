import { useState } from "react";
import { loginWithGoogle } from "../firebase";

export default function Login() {
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Erreur de connexion");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Connexion QR'COG</h1>
      <button onClick={handleLogin} style={{
        padding: "10px 20px",
        fontSize: "18px",
        cursor: "pointer"
      }}>
        Se connecter avec Google
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
