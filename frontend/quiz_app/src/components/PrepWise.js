import React, { useState } from "react";
// import axios from "axios";


export default function Prepwise() {
  const [file, setFile] = useState(null);
  const [mcqCount, setMcqCount] = useState(5);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // Mock data for testing UI before Flask connection
  // const sampleQuiz = [
  //   {
  //     id: 1,
  //     question: "Which data structure uses LIFO order?",
  //     options: ["Queue", "Stack", "Array", "Tree"],
  //     correct: "Stack",
  //   },
  //   {
  //     id: 2,
  //     question: "Which protocol is used for email?",
  //     options: ["HTTP", "SMTP", "FTP", "DNS"],
  //     correct: "SMTP",
  //   },
  // ];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleGenerateQuiz = async (e) => {
  e.preventDefault();
  if (!file) {
    alert("Please upload a study file first!");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("User object:", user);
  if (!user || !user.id) {
  alert("User not found in localStorage — please log in again.");
  return;
}
  formData.append("user_id", user?.id);
  formData.append("num_questions", mcqCount);
  formData.append("topic", topic);
  formData.append("difficulty", difficulty);

  try {
    const res = await fetch("http://127.0.0.1:5000/api/upload_generate", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to generate quiz");
      return;
    }
    // data.mcqs is array of {id, question, options}
    const mapped = data.mcqs.map((m) => ({
      id: m.id,
      question: m.question,
      options: m.options
    }));
    setQuiz(mapped);
    setSubmitted(false);
    setAnswers({});
    setScore(null);
  } catch (err) {
    console.error(err);
    alert("Error generating quiz");
  }
};

  const handleOptionSelect = (qid, option) => {
    setAnswers({ ...answers, [qid]: option });
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(answers).length !== quiz.length) {
      alert("Please answer all questions before submitting!");
      return;
    }

    let correctCount = 0;
    quiz.forEach((q) => {
      if (answers[q.id] === q.correct) correctCount++;
    });

    setScore(correctCount);
    setSubmitted(true);
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setScore(null);
    setSubmitted(false);
  };

  return (
    <div className="container mt-5">
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
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Number of MCQs (5–50):</label>
              <input
                type="number"
                className="form-control"
                min="5"
                max="50"
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

          {submitted && score !== null && (
            <div className="text-center mt-4">
              <h4>Your Score: {score} / {quiz.length}</h4>
              <button className="btn btn-primary mt-3 imp_button" onClick={handleRetakeQuiz}>
                Retake Quiz
              </button>
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

                {/* Keep this replacement code INSIDE here */}
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
