import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function Games({ clearNotification }) {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    clearNotification?.(); // on supprime la notif
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "quizzes"), (snapshot) => {
      const now = Date.now();

      const list = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((q) => q.expiresAt > now);

      setQuizzes(list);
    });

    return () => unsub();
  }, []);

  return (
    <div className="panel">
      <h2>Jeux / QCM disponibles 🎮</h2>

      {quizzes.length === 0 && <p>Aucun QCM disponible pour le moment.</p>}

      {quizzes.map((q) => (
        <div key={q.id} className="panel" style={{ marginTop: 20 }}>
          <h3>{q.title}</h3>

          <button
            className="primary"
            style={{ marginTop: 10 }}
            onClick={() => (window.location.href = "/quiz/" + q.id)}
          >
            Commencer
          </button>
        </div>
      ))}
    </div>
  );
}
