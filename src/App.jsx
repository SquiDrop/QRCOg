import { useEffect, useState } from "react";
import { auth, logout, createStudentIfNotExists, loginApproved, db } from "./firebase";
import Login from "./pages/Login";
import Scan from "./pages/Scan";
import AdminCreateSession from "./pages/AdminCreateSession";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLeaderboard from "./pages/AdminLeaderboard";
import AdminCreateQuiz from "./pages/AdminCreateQuiz";
import Games from "./pages/Games";
import PlayQuiz from "./pages/PlayQuiz";
import Layout from "./Layout";

import { Routes, Route } from "react-router-dom";
import { collection, doc, onSnapshot, query, where, getDocs } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [mode, setMode] = useState("home");
  const [hasNewQuiz, setHasNewQuiz] = useState(false);

  useEffect(() => auth.onAuthStateChanged((u) => setUser(u)), []);

  useEffect(() => {
    if (user) createStudentIfNotExists(user);
  }, [user]);

  // Points en temps réel
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "students", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setPoints(snap.data().totalPoints || 0);
    });

    return () => unsub();
  }, [user]);

  // Détection quiz non fait
  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, "quizzes"), async (snapshot) => {
      const now = Date.now();

      const allQuizzes = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((q) => q.expiresAt > now);

      const respSnap = await getDocs(
        query(
          collection(db, "quizResponses"),
          where("userId", "==", user.uid)
        )
      );

      const answered = respSnap.docs.map((d) => d.data().quizId);

      setHasNewQuiz(allQuizzes.some((q) => !answered.includes(q.id)));
    });

    return () => unsub();
  }, [user]);

  if (!user || !loginApproved) return <Login />;

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1>Bienvenue {user.displayName} 👋</h1>
              <p>{user.email}</p>

              <p style={{ fontSize: "20px", fontWeight: "bold" }}>
                Points totaux : {points} ⭐
              </p>

              <div style={{ marginBottom: 20 }}>
                <button onClick={() => setMode("scan")} style={{ marginRight: 10 }}>
                  Scanner un QR
                </button>

                <button
                  onClick={() => setMode("games")}
                  className="notif-button"
                  style={{ marginRight: 10 }}
                >
                  Jeux
                  {hasNewQuiz && <span className="notif-badge">1</span>}
                </button>

                <button onClick={() => setMode("admin")} style={{ marginRight: 10 }}>
                  Mode Admin
                </button>

                <button onClick={logout} className="danger">
                  Se déconnecter
                </button>
              </div>

              {mode === "scan" && <Scan />}
              {mode === "games" && (
                <Games clearNotification={() => setHasNewQuiz(false)} />
              )}
              {mode === "admin" && (
                <>
                  <AdminCreateSession />
                  <hr style={{ margin: "30px 0" }} />
                  <AdminCreateQuiz />
                  <hr style={{ margin: "30px 0" }} />
                  <AdminDashboard />
                  <hr style={{ margin: "30px 0" }} />
                  <AdminLeaderboard />
                </>
              )}
            </>
          }
        />
        <Route path="/quiz/:quizId" element={<PlayQuiz />} />
      </Routes>
    </Layout>
  );
}

export default App;
