import { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import QRCode from "qrcode";

export default function AdminCreateSession() {
  const [courseName, setCourseName] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [message, setMessage] = useState("");

  const createSession = async () => {
    if (!courseName) {
      setMessage("⚠️ Le nom du cours est obligatoire.");
      return;
    }

    // 1. Identifiant unique de la session (ex: session_2025-02-12_10h00)
    const now = new Date();
    const sessionId = `session_${now.toISOString()}`;

    // 2. Générer un token sécurisé
    const token = crypto.randomUUID();

    // 3. Définir expiration (ex: QR valide 3 minutes)
    const expiresAt = new Date(now.getTime() + 3 * 60 * 1000);

    // 4. Enregistrer en Firestore
    await setDoc(doc(db, "sessions", sessionId), {
      sessionId,
      token,
      courseName,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt.getTime(),
    });

    // 5. Générer le QR contenant sessionId + token
    const qrContent = JSON.stringify({
      sessionId,
      token,
    });

    const url = await QRCode.toDataURL(qrContent);
    setQrUrl(url);
    setMessage("Session créée ✔ QR généré !");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Créer un QR de cours</h2>

      <input
        type="text"
        placeholder="Nom du cours (ex: Physio)"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
      />

      <button onClick={createSession}>Créer le QR</button>

      <p>{message}</p>

      {qrUrl && (
        <div>
          <h3>QR Code</h3>
          <img src={qrUrl} alt="QR code cours" style={{ width: "250px" }} />
        </div>
      )}
    </div>
  );
}
