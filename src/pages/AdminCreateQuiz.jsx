import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AdminCreateQuiz() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(10);
  const [questions, setQuestions] = useState([
    { question: "", choices: ["", ""], correctIndex: 0 }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { question: "", choices: ["", ""], correctIndex: 0 }]);
  };

  const addChoice = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].choices.push("");
    setQuestions(updated);
  };

  const updateQuestion = (i, text) => {
    const updated = [...questions];
    updated[i].question = text;
    setQuestions(updated);
  };

  const updateChoice = (qi, ci, text) => {
    const updated = [...questions];
    updated[qi].choices[ci] = text;
    setQuestions(updated);
  };

  const createQuiz = async () => {
    if (!title.trim()) return alert("Titre requis");

    const expiresAt = Date.now() + duration * 60 * 1000;

    await addDoc(collection(db, "quizzes"), {
      title,
      questions,
      createdAt: serverTimestamp(),
      expiresAt,
    });

    alert("QCM créé !");
    setTitle("");
    setQuestions([{ question: "", choices: ["", ""], correctIndex: 0 }]);
  };

  return (
    <div className="panel">
      <h2>Créer un QCM</h2>

      <input
        placeholder="Titre du QCM"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Durée (minutes) :</label>
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
      />

      <h3>Questions</h3>

      {questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: "20px" }}>
          <input
            placeholder="Question"
            value={q.question}
            onChange={(e) => updateQuestion(qi, e.target.value)}
          />

          {q.choices.map((choice, ci) => (
            <div key={ci} className="response-line">
              <input
                placeholder={`Réponse ${ci + 1}`}
                value={choice}
                onChange={(e) => updateChoice(qi, ci, e.target.value)}
              />

              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name={"correct-" + qi}
                  checked={q.correctIndex === ci}
                  onChange={() => {
                    const updated = [...questions];
                    updated[qi].correctIndex = ci;
                    setQuestions(updated);
                  }}
                />
                Correct
              </label>
            </div>
          ))}

          <button onClick={() => addChoice(qi)} style={{ marginTop: 10 }}>
            + Ajouter une réponse
          </button>
        </div>
      ))}

      <button onClick={addQuestion}>+ Ajouter une question</button>

      <br /><br />

      <button className="success" onClick={createQuiz}>
        Créer le QCM
      </button>
    </div>
  );
}
