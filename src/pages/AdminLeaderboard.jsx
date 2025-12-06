import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminLeaderboard() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "students"),
      orderBy("totalPoints", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents(list);
    });

    return () => unsub();
  }, []);

  return (
    <div className="panel">
      <h2>Classement des points</h2>
      <p>{students.length} étudiants enregistrés</p>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Points</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s, index) => (
            <tr key={s.id}>
              <td>{index + 1}</td>
              <td>{s.name || "—"}</td>
              <td>{s.email}</td>
              <td>{s.totalPoints ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
