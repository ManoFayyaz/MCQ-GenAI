import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuiz } from "../context/QuizContext";
import API_URL from '../config';
import toast, { Toaster } from 'react-hot-toast';
import {
  Brain, Upload, Hash, BookOpen, Gauge, Sparkles,
  CheckCircle, XCircle, Trophy, RotateCcw, FileText,
  ChevronRight, Flame
} from 'lucide-react';

export default function Prepwise() {
  const [file, setFile] = useState(null);
  const [mcqCount, setMcqCount] = useState(5);
  const [topic, setTopic] = useState(sessionStorage.getItem("topic") || "");
  const [difficulty, setDifficulty] = useState(sessionStorage.getItem("difficulty") || "easy");
  const [loading, setLoading] = useState(false);
  const [showStreak, setShowStreak] = useState("");

  const {
    quiz, setQuiz,
    answers, setAnswers,
    submitted, setSubmitted,
    correctCount, setCorrectCount,
    wrongCount, setWrongCount,
    result, setResult,
    quizId, setQuizId
  } = useQuiz();

  // ------------------ LOAD FROM SESSION ------------------
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
  }, [setQuiz, setAnswers, setResult, setCorrectCount, setWrongCount, setQuizId]);

  useEffect(() => { sessionStorage.setItem("quiz", JSON.stringify(quiz)); }, [quiz]);
  useEffect(() => { sessionStorage.setItem("answers", JSON.stringify(answers)); }, [answers]);
  useEffect(() => { sessionStorage.setItem("result", JSON.stringify(result)); }, [result]);
  useEffect(() => { sessionStorage.setItem("correctCount", correctCount); sessionStorage.setItem("wrongCount", wrongCount); }, [correctCount, wrongCount]);
  useEffect(() => { sessionStorage.setItem("mcqCount", mcqCount); }, [mcqCount]);
  useEffect(() => { sessionStorage.setItem("quizId", quizId); }, [quizId]);
  useEffect(() => { sessionStorage.setItem("topic", topic); }, [topic]);
  useEffect(() => { sessionStorage.setItem("difficulty", difficulty); }, [difficulty]);

  // ------------------ FILE PERSISTENCE ------------------
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) return;
    const storedFile = localStorage.getItem(`uploadedFileName_${user.id}`);
    if (storedFile) setFile({ name: storedFile });
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
      toast.error("Please upload a study file first!");
      return;
    }

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
      toast.error("Please log in again.");
      return;
    }

    formData.append("user_id", user.id);
    formData.append("num_questions", mcqCount);
    formData.append("topic", topic);
    formData.append("difficulty", difficulty);

    setLoading(true);
    const loadingToast = toast.loading("Generating your quiz with AI...");

    try {
      const res = await fetch(`${API_URL}/api/upload_generate`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.dismiss(loadingToast);
        toast.error(data.error || "Failed to generate quiz");
        return;
      }

      setQuizId(data.quiz_id);
      const mapped = data.mcqs.map((m, index) => ({
        id: index + 1,
        question: m.question,
        options: m.options,
        correct: m.correct,
      }));

      setQuiz(mapped);
      setSubmitted(false);
      setAnswers({});
      setCorrectCount(0);
      setWrongCount(0);
      setResult(null);

      toast.dismiss(loadingToast);
      toast.success(`${mapped.length} MCQs generated successfully!`);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Error generating quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qid, option) => {
    setAnswers({ ...answers, [qid]: option });
  };

  const handleSubmitQuiz = async () => {
    if (!quizId) { toast.error("Quiz ID missing."); return; }
    if (Object.keys(answers).length !== quiz.length) {
      toast.error("Please answer all questions before submitting!");
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
      if (!user || !user.id) { toast.error("Please login again."); return; }

      const answersArray = quiz.map((q) => {
        const selectedOption = answers[q.id];
        return q.options.indexOf(selectedOption);
      });

      const res = await axios.post(
        `${API_URL}/api/quiz/${quizId}/submit`,
        { user_id: user.id, answers: answersArray }
      );

      if (res.data.streak) {
        setShowStreak(`Day ${res.data.streak} Streak!`);
        setTimeout(() => setShowStreak(""), 15000);
      }

      const pct = Math.round((correct / quiz.length) * 100);
      if (pct === 100) toast.success("Perfect score! Outstanding! 🏆");
      else if (pct >= 80) toast.success(`Great job! ${pct}% score!`);
      else if (pct >= 50) toast(`${pct}% score. Keep practicing!`, { icon: "📚" });
      else toast.error(`${pct}% score. Review your material.`);

    } catch (err) {
      toast.error("Failed to save quiz attempt.");
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setCorrectCount(0);
    setWrongCount(0);
    setResult(null);
  };

  const percentage = quiz.length > 0 ? Math.round((correctCount / quiz.length) * 100) : 0;

  const card = {
    backgroundColor: "#1e1e2e",
    border: "1px solid #2a2a3e",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
    marginBottom: "24px"
  };

  const inputStyle = {
    width: "100%",
    backgroundColor: "#2a2a3e",
    border: "1px solid #3a3a4e",
    borderRadius: "10px",
    padding: "11px 14px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
  };

  const labelStyle = {
    color: "#a0a0b0",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "8px"
  };

  return (
    <div style={{ backgroundColor: "#0f0f1a", minHeight: "100vh", padding: "32px 20px" }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: "#1e1e2e", color: "#fff", border: "1px solid #2a2a3e" }
      }} />

      {/* Spinner Overlay */}
      {loading && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(15,15,26,0.85)", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 9999, backdropFilter: "blur(4px)"
        }}>
          <div style={{
            width: "52px", height: "52px",
            border: "4px solid #2a2a3e",
            borderTop: "4px solid #d4f542",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }} />
          <p style={{ color: "#d4f542", marginTop: "20px", fontSize: "16px", fontWeight: "600" }}>
            Generating your quiz with AI...
          </p>
          <p style={{ color: "#a0a0b0", fontSize: "13px", marginTop: "6px" }}>
            This may take 15–30 seconds
          </p>
        </div>
      )}

      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
            <Brain size={32} color="#d4f542" />
            <h1 style={{ color: "#ffffff", fontSize: "28px", fontWeight: "800", margin: 0 }}>
              PrepWise Quiz Generator
            </h1>
          </div>
          <p style={{ color: "#a0a0b0", fontSize: "15px" }}>
            Upload your study material and generate personalized MCQs instantly
          </p>
        </div>

        {/* Streak Banner */}
        {showStreak && (
          <div style={{
            backgroundColor: "rgba(212, 245, 66, 0.1)",
            border: "1px solid rgba(212, 245, 66, 0.3)",
            borderRadius: "12px", padding: "14px 20px",
            display: "flex", alignItems: "center", gap: "10px",
            marginBottom: "24px"
          }}>
            <Flame size={22} color="#d4f542" />
            <span style={{ color: "#d4f542", fontWeight: "700", fontSize: "15px" }}>
              {showStreak}
            </span>
          </div>
        )}

        {/* Generation Form OR Result */}
        {!quiz.length || submitted ? (
          <>
            {/* Form */}
            <div style={card}>
              <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: "700", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} color="#d4f542" />
                Configure Your Quiz
              </h2>

              <form onSubmit={handleGenerateQuiz}>

                {/* File Upload */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>
                    <Upload size={15} color="#a0a0b0" /> Upload Study Material
                  </label>
                  <label style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    backgroundColor: "#2a2a3e", border: "2px dashed #3a3a4e",
                    borderRadius: "10px", padding: "16px 20px", cursor: "pointer",
                    transition: "border-color 0.2s"
                  }}
                    onMouseOver={e => e.currentTarget.style.borderColor = "#d4f542"}
                    onMouseOut={e => e.currentTarget.style.borderColor = "#3a3a4e"}
                  >
                    <FileText size={22} color="#d4f542" />
                    <div>
                      <p style={{ color: "#ffffff", margin: 0, fontSize: "14px", fontWeight: "500" }}>
                        {file ? file.name : "Click to upload file"}
                      </p>
                      <p style={{ color: "#a0a0b0", margin: 0, fontSize: "12px" }}>
                        PDF, DOCX, PPTX, TXT supported
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx,.ppt,.pptx"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                {/* MCQ Count */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>
                    <Hash size={15} color="#a0a0b0" /> Number of MCQs (5–25)
                  </label>
                  <input
                    type="number"
                    min="5" max="30"
                    value={mcqCount}
                    onChange={(e) => setMcqCount(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#d4f542"}
                    onBlur={e => e.target.style.borderColor = "#3a3a4e"}
                  />
                </div>

                {/* Topic */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>
                    <BookOpen size={15} color="#a0a0b0" /> Topic (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Networking, OOP, Data Structures..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#d4f542"}
                    onBlur={e => e.target.style.borderColor = "#3a3a4e"}
                  />
                </div>

                {/* Difficulty */}
                <div style={{ marginBottom: "28px" }}>
                  <label style={labelStyle}>
                    <Gauge size={15} color="#a0a0b0" /> Difficulty Level
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {["easy", "medium", "hard"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "10px",
                          border: difficulty === level ? "2px solid #d4f542" : "1px solid #3a3a4e",
                          backgroundColor: difficulty === level ? "rgba(212,245,66,0.1)" : "#2a2a3e",
                          color: difficulty === level ? "#d4f542" : "#a0a0b0",
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer",
                          textTransform: "capitalize",
                          transition: "all 0.2s"
                        }}
                      >
                        {level === "easy" ? "🟢" : level === "medium" ? "🟡" : "🔴"} {level}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    backgroundColor: "#d4f542",
                    color: "#0f0f1a",
                    border: "none",
                    borderRadius: "10px",
                    padding: "13px",
                    fontWeight: "700",
                    fontSize: "15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <Sparkles size={18} />
                  Generate Quiz
                </button>
              </form>
            </div>

            {/* Result Section */}
            {submitted && (
              <div style={card}>
                <h3 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Trophy size={22} color="#d4f542" /> Quiz Results
                </h3>

                {/* Score Circle */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{
                    display: "inline-flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    width: "120px", height: "120px",
                    borderRadius: "50%",
                    border: `4px solid ${percentage >= 80 ? "#d4f542" : percentage >= 50 ? "#a8d8f0" : "#ff6b6b"}`,
                    backgroundColor: "#2a2a3e"
                  }}>
                    <span style={{ fontSize: "28px", fontWeight: "800", color: percentage >= 80 ? "#d4f542" : percentage >= 50 ? "#a8d8f0" : "#ff6b6b" }}>
                      {percentage}%
                    </span>
                    <span style={{ color: "#a0a0b0", fontSize: "12px" }}>Score</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                  {[
                    { label: "Correct", value: correctCount, color: "#d4f542", icon: <CheckCircle size={18} color="#d4f542" /> },
                    { label: "Wrong", value: wrongCount, color: "#ff6b6b", icon: <XCircle size={18} color="#ff6b6b" /> },
                    { label: "Total", value: quiz.length, color: "#a8d8f0", icon: <Hash size={18} color="#a8d8f0" /> }
                  ].map((stat) => (
                    <div key={stat.label} style={{
                      flex: 1, backgroundColor: "#2a2a3e",
                      borderRadius: "12px", padding: "16px",
                      textAlign: "center", border: "1px solid #3a3a4e"
                    }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "6px" }}>{stat.icon}</div>
                      <div style={{ fontSize: "22px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: "12px", color: "#a0a0b0" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleRetakeQuiz}
                  style={{
                    width: "100%",
                    backgroundColor: "#d4f542",
                    color: "#0f0f1a",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px",
                    fontWeight: "700",
                    fontSize: "15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginBottom: "24px"
                  }}
                >
                  <RotateCcw size={16} /> Retake Quiz
                </button>

                {/* Review Section */}
                {result && result.details && (
                  <div>
                    <h4 style={{ color: "#ffffff", fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <BookOpen size={18} color="#d4f542" /> Review Answers
                    </h4>
                    {result.details.map((item, index) => (
                      <div key={index} style={{
                        backgroundColor: "#2a2a3e",
                        border: `1px solid ${item.is_correct ? "rgba(212,245,66,0.3)" : "rgba(255,107,107,0.3)"}`,
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "12px"
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          {item.is_correct
                            ? <CheckCircle size={18} color="#d4f542" style={{ flexShrink: 0, marginTop: "2px" }} />
                            : <XCircle size={18} color="#ff6b6b" style={{ flexShrink: 0, marginTop: "2px" }} />
                          }
                          <div>
                            <p style={{ color: "#ffffff", fontWeight: "600", margin: "0 0 8px 0", fontSize: "14px" }}>
                              {index + 1}. {item.question}
                            </p>
                            {!item.is_correct && (
                              <>
                                <p style={{ margin: "0 0 4px 0", fontSize: "13px" }}>
                                  <span style={{ color: "#ff6b6b" }}>Your answer: </span>
                                  <span style={{ color: "#ffffff" }}>{item.selected_option || "No answer"}</span>
                                </p>
                                <p style={{ margin: 0, fontSize: "13px" }}>
                                  <span style={{ color: "#d4f542" }}>Correct answer: </span>
                                  <span style={{ color: "#ffffff" }}>{item.correct_option}</span>
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Quiz Attempt Section */
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: "700", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Brain size={20} color="#d4f542" /> Quiz
              </h3>
              <span style={{
                backgroundColor: "rgba(212,245,66,0.1)",
                color: "#d4f542",
                border: "1px solid rgba(212,245,66,0.3)",
                borderRadius: "8px",
                padding: "4px 12px",
                fontSize: "13px",
                fontWeight: "600"
              }}>
                {Object.keys(answers).length} / {quiz.length} answered
              </span>
            </div>

            {quiz.map((q) => (
              <div key={q.id} style={{
                backgroundColor: "#2a2a3e",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "16px",
                border: "1px solid #3a3a4e"
              }}>
                <p style={{ color: "#ffffff", fontWeight: "600", fontSize: "15px", marginBottom: "14px" }}>
                  <span style={{ color: "#d4f542", marginRight: "8px" }}>{q.id}.</span>
                  {q.question}
                </p>

                {q.options.map((opt, i) => (
                  <label key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    cursor: "pointer",
                    border: answers[q.id] === opt ? "1px solid #d4f542" : "1px solid #3a3a4e",
                    backgroundColor: answers[q.id] === opt ? "rgba(212,245,66,0.08)" : "transparent",
                    transition: "all 0.15s"
                  }}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === opt}
                      onChange={() => handleOptionSelect(q.id, opt)}
                      style={{ display: "none" }}
                    />
                    <div style={{
                      width: "18px", height: "18px",
                      borderRadius: "50%",
                      border: answers[q.id] === opt ? "2px solid #d4f542" : "2px solid #3a3a4e",
                      backgroundColor: answers[q.id] === opt ? "#d4f542" : "transparent",
                      flexShrink: 0, transition: "all 0.15s"
                    }} />
                    <span style={{ color: answers[q.id] === opt ? "#d4f542" : "#a0a0b0", fontSize: "14px" }}>
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            ))}

            <button
              onClick={handleSubmitQuiz}
              style={{
                width: "100%",
                backgroundColor: "#d4f542",
                color: "#0f0f1a",
                border: "none",
                borderRadius: "10px",
                padding: "13px",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "8px"
              }}
            >
              <ChevronRight size={18} /> Submit Quiz
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useQuiz } from "../context/QuizContext";
// import API_URL from '../config';


// export default function Prepwise() {
//   const [file, setFile] = useState(null);
//   const [mcqCount, setMcqCount] = useState(5);
//   const [topic, setTopic] = useState(sessionStorage.getItem("topic") || "");
//   const [difficulty, setDifficulty] = useState(sessionStorage.getItem("difficulty") || "easy");


//   const {
//   quiz, setQuiz,
//   answers, setAnswers,
//   submitted, setSubmitted,
//   correctCount, setCorrectCount,
//   wrongCount, setWrongCount,
//   result, setResult,
//   quizId, setQuizId
// } = useQuiz();

//   const [showStreak, setShowStreak] = useState("");



 

//   // ------------------ LOAD EVERYTHING ON MOUNT ------------------
//   useEffect(() => {
//     const savedQuiz = sessionStorage.getItem("quiz");
//     const savedAnswers = sessionStorage.getItem("answers");
//     const savedResult = sessionStorage.getItem("result");
//     const savedCorrect = sessionStorage.getItem("correctCount");
//     const savedWrong = sessionStorage.getItem("wrongCount");
//     const savedMcq = sessionStorage.getItem("mcqCount");
//     const savedQuizId = sessionStorage.getItem("quizId");

//     if (savedQuiz) setQuiz(JSON.parse(savedQuiz));
//     if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
//     if (savedResult) setResult(JSON.parse(savedResult));
//     if (savedCorrect) setCorrectCount(Number(savedCorrect));
//     if (savedWrong) setWrongCount(Number(savedWrong));
//     if (savedMcq) setMcqCount(Number(savedMcq));
//     if (savedQuizId) setQuizId(savedQuizId);
//   }, [
//   setQuiz,
//   setAnswers,
//   setResult,
//   setCorrectCount,
//   setWrongCount,
//   setQuizId,
//   setMcqCount
// ]);

//   // ------------------ SAVE TO SESSION STORAGE ------------------
//   useEffect(() => {
//     sessionStorage.setItem("quiz", JSON.stringify(quiz));
//   }, [quiz]);

//   useEffect(() => {
//     sessionStorage.setItem("answers", JSON.stringify(answers));
//   }, [answers]);

//   useEffect(() => {
//     sessionStorage.setItem("result", JSON.stringify(result));
//   }, [result]);

//   useEffect(() => {
//     sessionStorage.setItem("correctCount", correctCount);
//     sessionStorage.setItem("wrongCount", wrongCount);
//   }, [correctCount, wrongCount]);

//   useEffect(() => {
//     sessionStorage.setItem("mcqCount", mcqCount);
//   }, [mcqCount]);

//   useEffect(() => {
//     sessionStorage.setItem("quizId", quizId);
//   }, [quizId]);

//   // Save topic/difficulty as well
//   useEffect(() => {
//     sessionStorage.setItem("topic", topic);
//   }, [topic]);

//   useEffect(() => {
//     sessionStorage.setItem("difficulty", difficulty);
//   }, [difficulty]);

//   // sessionStorage removal on new quiz generation
//   useEffect(() => {
//   sessionStorage.setItem("quiz", JSON.stringify(quiz));
// }, [quiz]);


//   // ------------------ FILE PERSISTENCE ------------------
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (!user || !user.id) return;

//     const storedFile = localStorage.getItem(`uploadedFileName_${user.id}`);
//     if (storedFile) {
//       setFile({ name: storedFile });
//     }
//   }, []);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     setFile(selectedFile);

//     const user = JSON.parse(localStorage.getItem("user"));
//     if (selectedFile && user && user.id) {
//       localStorage.setItem(`uploadedFileName_${user.id}`, selectedFile.name);
//     }
//   };

//   const handleGenerateQuiz = async (e) => {
//     e.preventDefault();
//     if (!file) {
//       alert("Please upload a study file first!");
//       return;
//     }

//     // ------------------ CLEAR OLD SESSION QUIZ ------------------
//     sessionStorage.removeItem("quiz");
//     sessionStorage.removeItem("answers");
//     sessionStorage.removeItem("result");
//     sessionStorage.removeItem("correctCount");
//     sessionStorage.removeItem("wrongCount");
//     sessionStorage.removeItem("quizId");

//     const formData = new FormData();
//     formData.append("file", file);
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (!user || !user.id) {
//       alert("User not found in localStorage — please log in again.");
//       return;
//     }

//     formData.append("user_id", user.id);
//     formData.append("num_questions", mcqCount);
//     formData.append("topic", topic);
//     formData.append("difficulty", difficulty);

//     try {
//       const res = await fetch(`${API_URL}/api/upload_generate`, {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         alert(data.error || "Failed to generate quiz");
//         return;
//       }

//       setQuiz(data.mcqs);
//       setQuizId(data.quiz_id);

//       const mapped = data.mcqs.map((m, index) => ({
//         id: index + 1,
//         question: m.question,
//         options: m.options,
//         correct: m.correct,
//       }));

//       setQuiz(mapped);
//       // setQuiz(data.mcqs); 
//       setSubmitted(false);
//       setAnswers({});
//       setCorrectCount(0);
//       setWrongCount(0);
//       setResult(null);
//     } catch (err) {
//       console.error(err);
//       alert("Error generating quiz");
//     }
//   };

//   // Handle option selection changes
//   const handleOptionSelect = (qid, option) => {
//     setAnswers({ ...answers, [qid]: option });
//   };

//   const handleSubmitQuiz = async () => {
//     if (!quizId) {
//       alert("Quiz ID missing. Cannot submit.");
//       return;
//     }

//     if (Object.keys(answers).length !== quiz.length) {
//       alert("Please answer all questions before submitting!");
//       return;
//     }

//     let correct = 0;
//     let wrong = 0;
//     const details = [];

//     quiz.forEach((q) => {
//       const selected = answers[q.id];
//       const isCorrect = selected === q.correct;
//       if (isCorrect) correct++;
//       else wrong++;

//       details.push({
//         question: q.question,
//         selected_option: selected,
//         correct_option: q.correct,
//         is_correct: isCorrect,
//       });
//     });

//     setCorrectCount(correct);
//     setWrongCount(wrong);
//     setResult({ details });
//     setSubmitted(true);

//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (!user || !user.id) {
//         alert("User not found. Please login again.");
//         return;
//       }

     

//       const answersArray = quiz.map((q) => {
//         const selectedOption = answers[q.id];
//         return q.options.indexOf(selectedOption); // get index
//       });

//       const res=await axios.post(
//         `${API_URL}/api/quiz/${quizId}/submit`,
//         { user_id: user.id, answers: answersArray }
//       );

//       console.log("Quiz attempt saved!");

//       // streak incoming from backend
//       if (res.data.streak) {
//         setShowStreak(`🔥 Streak Day: ${res.data.streak}`);
//         setTimeout(() => setShowStreak(""), 15000); // hide message after 15s
//       }


//     } catch (err) {
//       console.error("Error saving attempt:", err);
//       alert("Failed to save quiz attempt.");
//     }
//   };

//   const handleRetakeQuiz = () => {
//     setAnswers({});
//     setSubmitted(false);
//     setCorrectCount(0);
//     setWrongCount(0);
//     setResult(null);
//   };

//   return (
//     <div className="container mt-5">
//       {showStreak && (
//         <div
//           className="alert alert-warning text-center fw-bold"
//           style={{ fontSize: "1.2rem" }}
//         >
//           {showStreak}
//         </div>
//         )}

//       <h2 className="text-center mb-4">🧠 PrepWise Quiz Generator</h2>

//       {!quiz.length || submitted ? (
//         <>
//           <form className="card p-4 shadow-sm" onSubmit={handleGenerateQuiz}>
//             <div className="mb-3">
//               <label className="form-label fw-bold">Upload Study Material:</label>
//               <input
//                 type="file"
//                 accept=".pdf,.txt,.docx,.ppt,.pptx"
//                 className="form-control"
//                 onChange={handleFileChange}
//               />
//               {file && (
//                 <p className="mt-2 text-success">
//                   📁 Using: <strong>{file.name}</strong>
//                 </p>
//               )}
//             </div>

//             <div className="mb-3">
//               <label className="form-label fw-bold">Number of MCQs (5–30):</label>
//               <input
//                 type="number"
//                 className="form-control"
//                 min="5"
//                 max="30"
//                 value={mcqCount}
//                 onChange={(e) => setMcqCount(e.target.value)}
//               />
//             </div>

//             <div className="mb-3">
//               <label className="form-label fw-bold">Topic (optional):</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="e.g., Networking, OOP..."
//                 value={topic}
//                 onChange={(e) => setTopic(e.target.value)}
//               />
//             </div>

//             <div className="mb-3">
//               <label className="form-label fw-bold">Difficulty Level:</label>
//               <select
//                 className="form-select"
//                 value={difficulty}
//                 onChange={(e) => setDifficulty(e.target.value)}
//               >
//                 <option value="easy">Easy</option>
//                 <option value="medium">Medium</option>
//                 <option value="hard">Hard</option>
//               </select>
//             </div>

//             <button type="submit" className="btn btn-success w-100 imp_button">
//               Generate Quiz
//             </button>
//           </form>

//           {submitted && (
//             <div className="text-center mt-4 card p-3 shadow-sm">
//               <h4 className="fw-bold">📊 Quiz Result</h4>
//               <p>✅ Correct: {correctCount}</p>
//               <p>❌ Wrong: {wrongCount}</p>
//               <p>🏆 Score: {correctCount} / {quiz.length}</p>
//               <button className="btn btn-primary mt-3 imp_button" onClick={handleRetakeQuiz}>
//                 Retake Quiz
//               </button>

//               {result && result.details && (
//                 <div className="mt-4 text-start">
//                   <h5 className="fw-bold mb-2">🔍 Review</h5>
//                   {result.details.map((item, index) => (
//                     <div
//                       key={index}
//                       className={`p-2 mb-2 rounded ${
//                         item.is_correct ? "bg-light text-success" : "bg-light text-danger"
//                       }`}
//                     >
//                       <p className="mb-1 fw-medium">
//                         {item.is_correct ? "✅" : "❌"} {item.question}
//                       </p>
//                       {!item.is_correct && (
//                         <>
//                           <p className="mb-0">
//                             <strong>Your Answer:</strong> {item.selected_option || "No answer"}
//                           </p>
//                           <p className="mb-0">
//                             <strong>Correct Answer:</strong> {item.correct_option}
//                           </p>
//                         </>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </>
//       ) : (
//         <div className="card p-4 shadow-sm">
//           <h4 className="mb-3">Quiz</h4>
//           {quiz.map((q) => (
//             <div key={q.id} className="mb-4">
//               <p className="fw-bold">
//                 {q.id}. {q.question}
//               </p>

//               {q.options.map((opt, i) => (
//                 <label
//                   key={i}
//                   className="d-block p-2 border rounded mb-2"
//                   style={{
//                     cursor: "pointer",
//                     backgroundColor: answers[q.id] === opt ? "#e6ffe6" : "#fff",
//                   }}
//                 >
//                   <input
//                     type="radio"
//                     className="form-check-input me-2"
//                     name={`q-${q.id}`}
//                     checked={answers[q.id] === opt}
//                     onChange={() => handleOptionSelect(q.id, opt)}
//                     style={{ cursor: "pointer" }}
//                   />
//                   {opt}
//                 </label>
//               ))}
//             </div>
//           ))}

//           <button className="btn btn-success w-100 imp_button" onClick={handleSubmitQuiz}>
//             Submit Quiz
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }