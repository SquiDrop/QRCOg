import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth, addPoints } from "../firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export default function PlayQuiz() {
    const { quizId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            const snap = await getDoc(doc(db, "quizzes", quizId));
            if (snap.exists()) setQuiz(snap.data());
        };
        fetchQuiz();
    }, [quizId]);

    const alreadyAnswered = async () => {
        const q = query(
            collection(db, "quizResponses"),
            where("quizId", "==", quizId),
            where("userId", "==", auth.currentUser.uid)
        );
        const res = await getDocs(q);
        return !res.empty;
    };

    const handleSubmit = async () => {
        if (await alreadyAnswered()) {
            alert("Vous avez déjà répondu à ce QCM.");
            return;
        }

        let correctCount = 0;

        quiz.questions.forEach((q, i) => {
            if (answers[i] === q.correctIndex) correctCount++;
        });

        const allCorrect = correctCount === quiz.questions.length;
        setScore(correctCount);
        setSubmitted(true);

        await addDoc(collection(db, "quizResponses"), {
            userId: auth.currentUser.uid,
            quizId,
            correct: allCorrect,
            timestamp: serverTimestamp(),
        });

        if (allCorrect) {
            await addPoints(auth.currentUser.uid, 1, "quiz", quizId);
        }
    };

    if (!quiz) return <p>Chargement du QCM...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h2>{quiz.title}</h2>

            {submitted ? (
                <>
                    <h3>Résultat :</h3>
                    <p>
                        {score} / {quiz.questions.length} bonnes réponses
                    </p>
                    {score === quiz.questions.length ? (
                        <p style={{ color: "lightgreen" }}>✔ Bravo, +1 point !</p>
                    ) : (
                        <p style={{ color: "red" }}>❌ Dommage, aucune récompense.</p>
                    )}

                    <button onClick={() => window.location.href = "/"}>Retour</button>
                </>
            ) : (
                <>
                    {quiz.questions.map((q, i) => (
                        <div key={i} style={{ marginBottom: 20 }}>
                            <h3>{q.question}</h3>

                            {q.choices.map((choice, ci) => (
                                <label
                                    key={ci}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        marginTop: "8px",
                                        cursor: "pointer"
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name={`q-${i}`}
                                        onChange={() => setAnswers({ ...answers, [i]: ci })}
                                        checked={answers[i] === ci}
                                        style={{ transform: "scale(1.2)" }}
                                    />
                                    <span>{choice}</span>
                                </label>
                            ))}

                        </div>
                    ))}

                    <button onClick={handleSubmit} style={{ padding: 10 }}>
                        Valider mes réponses
                    </button>
                </>
            )}
        </div>
    );
}
