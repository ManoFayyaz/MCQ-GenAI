import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuiz } from "../context/QuizContext";
import API_URL from './config';


export default function Prepwise() {
  const [file, setFile] = useState(null);
  const [mcqCount, setMcqCount] = useState(5);
  const [topic, setTopic] = useState(sessionStorage.getItem("topic") || "");
  const [difficulty, setDifficulty] = useState(sessionStorage.getItem("difficulty") || "easy");


  const {
  quiz, setQuiz,
  answers, setAnswers,
  submitted, setSubmitted,
  correctCount, setCorrectCount,
  wrongCount, setWrongCount,
  result, setResult,
  quizId, setQuizId
} = useQuiz();

  const [showStreak, setShowStreak] = useState("");



 

  // ------------------ LOAD EVERYTHING ON MOUNT ------------------
  useEffect(() => {
    const savedQuiz = sessionStorage.getItem("quiz");
    const savedAnswers = sessionStorage.getItem("answers");
    const savedResult = sessionStorage.getItem("result");
    const savedCorrect = sessionStorage.getItem("correctCount");
    const savedWrong = sessionStorage.getItem("wrongCount");
    const savedMcq = sessionStorage.getItem("mcqCount");
    const savedQuizId = sessionStorage.getItem("quizId");

    if (savedQuiz) setQuiz(JSON.parse(savedQuiz));
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    if (savedResult) setResult(JSON.parse(savedResult));
    if (savedCorrect) setCorrectCount(Number(savedCorrect));
    if (savedWrong) setWrongCount(Number(savedWrong));
    if (savedMcq) setMcqCount(Number(savedMcq));
    if (savedQuizId) setQuizId(savedQuizId);
  }, [
  setQuiz,
  setAnswers,
  setResult,
  setCorrectCount,
  setWrongCount,
  setQuizId,
  setMcqCount
]);

  // ------------------ SAVE TO SESSION STORAGE ------------------
  useEffect(() => {
    sessionStorage.setItem("quiz", JSON.stringify(quiz));
  }, [quiz]);

  useEffect(() => {
    sessionStorage.setItem("answers", JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    sessionStorage.setItem("result", JSON.stringify(result));
  }, [result]);

  useEffect(() => {
    sessionStorage.setItem("correctCount", correctCount);
    sessionStorage.setItem("wrongCount", wrongCount);
  }, [correctCount, wrongCount]);

  useEffect(() => {
    sessionStorage.setItem("mcqCount", mcqCount);
  }, [mcqCount]);

  useEffect(() => {
    sessionStorage.setItem("quizId", quizId);
  }, [quizId]);

  // Save topic/difficulty as well
  useEffect(() => {
    sessionStorage.setItem("topic", topic);
  }, [topic]);

  useEffect(() => {
    sessionStorage.setItem("difficulty", difficulty);
  }, [difficulty]);

  // sessionStorage removal on new quiz generation
  useEffect(() => {
  sessionStorage.setItem("quiz", JSON.stringify(quiz));
}, [quiz]);


  // ------------------ FILE PERSISTENCE ------------------
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) return;

    const storedFile = localStorage.getItem(`uploadedFileName_${user.id}`);
    if (storedFile) {
      setFile({ name: storedFile });
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const user = JSON.parse(localStorage.getItem("user"));
    if (selectedFile && user && user.id) {
      localStorage.setItem(`uploadedFileName_${user.id}`, selectedFile.name);
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a study file first!");
      return;
    }

    // ------------------ CLEAR OLD SESSION QUIZ ------------------
    sessionStorage.removeItem("quiz");
    sessionStorage.removeItem("answers");
    sessionStorage.removeItem("result");
    sessionStorage.removeItem("correctCount");
    sessionStorage.removeItem("wrongCount");
    sessionStorage.removeItem("quizId");

    const formData = new FormData();
    formData.append("file", file);
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      alert("User not found in localStorage — please log in again.");
      return;
    }

    formData.append("user_id", user.id);
    formData.append("num_questions", mcqCount);
    formData.append("topic", topic);
    formData.append("difficulty", difficulty);

    try {
      const res = await fetch(`${API_URL}/api/upload_generate`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to generate quiz");
        return;
      }

      setQuiz(data.mcqs);
      setQuizId(data.quiz_id);

      const mapped = data.mcqs.map((m, index) => ({
        id: index + 1,
        question: m.question,
        options: m.options,
        correct: m.correct,
      }));

      setQuiz(mapped);
      // setQuiz(data.mcqs); 
      setSubmitted(false);
      setAnswers({});
      setCorrectCount(0);
      setWrongCount(0);
      setResult(null);
    } catch (err) {
      console.error(err);
      alert("Error generating quiz");
    }
  };

  // Handle option selection changes
  const handleOptionSelect = (qid, option) => {
    setAnswers({ ...answers, [qid]: option });
  };

  const handleSubmitQuiz = async () => {
    if (!quizId) {
      alert("Quiz ID missing. Cannot submit.");
      return;
    }

    if (Object.keys(answers).length !== quiz.length) {
      alert("Please answer all questions before submitting!");
      return;
    }

    let correct = 0;
    let wrong = 0;
    const details = [];

    quiz.forEach((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correct;
      if (isCorrect) correct++;
      else wrong++;

      details.push({
        question: q.question,
        selected_option: selected,
        correct_option: q.correct,
        is_correct: isCorrect,
      });
    });

    setCorrectCount(correct);
    setWrongCount(wrong);
    setResult({ details });
    setSubmitted(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        alert("User not found. Please login again.");
        return;
      }

     

      const answersArray = quiz.map((q) => {
        const selectedOption = answers[q.id];
        return q.options.indexOf(selectedOption); // get index
      });

      const res=await axios.post(
        `${API_URL}/api/quiz/${quizId}/submit`,
        { user_id: user.id, answers: answersArray }
      );

      console.log("Quiz attempt saved!");

      // streak incoming from backend
      if (res.data.streak) {
        setShowStreak(`🔥 Streak Day: ${res.data.streak}`);
        setTimeout(() => setShowStreak(""), 15000); // hide message after 15s
      }


    } catch (err) {
      console.error("Error saving attempt:", err);
      alert("Failed to save quiz attempt.");
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setCorrectCount(0);
    setWrongCount(0);
    setResult(null);
  };

  return (
    <div className="container mt-5">
      {showStreak && (
        <div
          className="alert alert-warning text-center fw-bold"
          style={{ fontSize: "1.2rem" }}
        >
          {showStreak}
        </div>
        )}

      <h2 className="text-center mb-4">🧠 PrepWise Quiz Generator</h2>

      {!quiz.length || submitted ? (
        <>
          <form className="card p-4 shadow-sm" onSubmit={handleGenerateQuiz}>
            <div className="mb-3">
              <label className="form-label fw-bold">Upload Study Material:</label>
              <input
                type="file"
                accept=".pdf,.txt,.docx,.ppt,.pptx"
                className="form-control"
                onChange={handleFileChange}
              />
              {file && (
                <p className="mt-2 text-success">
                  📁 Using: <strong>{file.name}</strong>
                </p>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Number of MCQs (5–30):</label>
              <input
                type="number"
                className="form-control"
                min="5"
                max="30"
                value={mcqCount}
                onChange={(e) => setMcqCount(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Topic (optional):</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Networking, OOP..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Difficulty Level:</label>
              <select
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <button type="submit" className="btn btn-success w-100 imp_button">
              Generate Quiz
            </button>
          </form>

          {submitted && (
            <div className="text-center mt-4 card p-3 shadow-sm">
              <h4 className="fw-bold">📊 Quiz Result</h4>
              <p>✅ Correct: {correctCount}</p>
              <p>❌ Wrong: {wrongCount}</p>
              <p>🏆 Score: {correctCount} / {quiz.length}</p>
              <button className="btn btn-primary mt-3 imp_button" onClick={handleRetakeQuiz}>
                Retake Quiz
              </button>

              {result && result.details && (
                <div className="mt-4 text-start">
                  <h5 className="fw-bold mb-2">🔍 Review</h5>
                  {result.details.map((item, index) => (
                    <div
                      key={index}
                      className={`p-2 mb-2 rounded ${
                        item.is_correct ? "bg-light text-success" : "bg-light text-danger"
                      }`}
                    >
                      <p className="mb-1 fw-medium">
                        {item.is_correct ? "✅" : "❌"} {item.question}
                      </p>
                      {!item.is_correct && (
                        <>
                          <p className="mb-0">
                            <strong>Your Answer:</strong> {item.selected_option || "No answer"}
                          </p>
                          <p className="mb-0">
                            <strong>Correct Answer:</strong> {item.correct_option}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="card p-4 shadow-sm">
          <h4 className="mb-3">Quiz</h4>
          {quiz.map((q) => (
            <div key={q.id} className="mb-4">
              <p className="fw-bold">
                {q.id}. {q.question}
              </p>

              {q.options.map((opt, i) => (
                <label
                  key={i}
                  className="d-block p-2 border rounded mb-2"
                  style={{
                    cursor: "pointer",
                    backgroundColor: answers[q.id] === opt ? "#e6ffe6" : "#fff",
                  }}
                >
                  <input
                    type="radio"
                    className="form-check-input me-2"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === opt}
                    onChange={() => handleOptionSelect(q.id, opt)}
                    style={{ cursor: "pointer" }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}

          <button className="btn btn-success w-100 imp_button" onClick={handleSubmitQuiz}>
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
}