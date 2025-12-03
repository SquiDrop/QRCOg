import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { db, auth } from "../firebase";
import {
  collection, addDoc, serverTimestamp,
  query, where, getDocs,
  doc, getDoc
} from "firebase/firestore";
import { addPoints } from "../firebase";


export default function Scan() {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState("");
  

  // Lance ou stoppe le scanner
  useEffect(() => {
    if (!isActive) return;

    setMessage("Scanner activé. Visez le QR…");

    scannerRef.current = new QrScanner(
      videoRef.current,
      async (result) => {
        // Dès qu'un QR est lu → stop caméra
        scannerRef.current.stop();
        setIsActive(false);
        setMessage("QR détecté, vérification…");

        let data;
        try {
          data = JSON.parse(result.data); // QR officiel = JSON
        } catch {
          setMessage("❌ QR invalide !");
          return;
        }

        const { sessionId, token } = data;
        if (!sessionId || !token) {
          setMessage("❌ QR incomplet !");
          return;
        }

        try {
          // 1️⃣ Vérifier session
          const sessionRef = doc(db, "sessions", sessionId);
          const sessionSnap = await getDoc(sessionRef);

          if (!sessionSnap.exists()) {
            setMessage("❌ Session inexistante !");
            return;
          }

          const session = sessionSnap.data();

          // 2️⃣ Token valide ?
          if (session.token !== token) {
            setMessage("❌ QR falsifié !");
            return;
          }

          // 3️⃣ Vérifier expiration
          if (Date.now() > session.expiresAt) {
            setMessage("⏳ QR expiré !");
            return;
          }

          // 4️⃣ Déjà scanné ?
          const q = query(
            collection(db, "scans"),
            where("userId", "==", auth.currentUser.uid),
            where("sessionId", "==", sessionId)
          );
          const existing = await getDocs(q);

          if (!existing.empty) {
            setMessage("⚠️ Déjà scanné !");
            return;
          }

          // 5️⃣ Enregistrement
          await addDoc(collection(db, "scans"), {
            userId: auth.currentUser.uid,
            email: auth.currentUser.email,
            sessionId,
            courseName: session.courseName || null,
            timestamp: serverTimestamp(),
          });


          await addPoints(auth.currentUser.uid, 1, "presence", sessionId);
          setMessage("✔ Présence enregistrée ! (+1 point)");
        } catch (err) {
          console.error(err);
          setMessage("Erreur lors de la vérification ❌");
        }
      },
      { returnDetailedScanResult: true }
    );

    scannerRef.current.start();

    return () => {
      if (scannerRef.current) scannerRef.current.stop();
    };
  }, [isActive]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Scanner un QR Code</h2>

      {/* Vidéo */}
      {isActive && (
        <video
          ref={videoRef}
          style={{ width: "300px", border: "2px solid black" }}
        ></video>
      )}

      {/* Message */}
      <p style={{ marginTop: 20, fontSize: 18 }}>{message}</p>

      {/* Bouton principal */}
      {!isActive && (
        <button
          onClick={() => {
            setMessage("");
            setIsActive(true);
          }}
          style={{ padding: "10px 20px", marginRight: 10 }}
        >
          🎥 Activer le scanner
        </button>
      )}

      {isActive && (
        <button
          onClick={() => {
            scannerRef.current.stop();
            setIsActive(false);
            setMessage("Scanner arrêté.");
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#555",
            color: "white",
          }}
        >
          ✋ Arrêter le scanner
        </button>
      )}
    </div>
  );
}
