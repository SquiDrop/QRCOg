import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminDashboard() {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "scans"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setScans(list);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      style={{
        marginTop: 30,
        padding: 20,
        borderRadius: 12,
        backgroundColor: "#111",
        color: "#f5f5f5",
      }}
    >
      <h2>Tableau de bord - Présences</h2>
      <p>{scans.length} scans enregistrés</p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 20,
        }}
      >
        <thead>
          <tr>
            <th style={th}>Email</th>
            <th style={th}>Cours</th>
            <th style={th}>Date</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr key={scan.id} style={tr}>
              <td style={td}>{scan.email}</td>
              <td style={td}>{scan.courseName || "—"}</td>
              <td style={td}>
                {scan.timestamp?.toDate?.().toLocaleString("fr-FR") || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  borderBottom: "2px solid #333",
  padding: "10px",
  textAlign: "left",
  backgroundColor: "#222",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #333",
  color: "#f5f5f5",
};

const tr = {
  backgroundColor: "#181818",
};
