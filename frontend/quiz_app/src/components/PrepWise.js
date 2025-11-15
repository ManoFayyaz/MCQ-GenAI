import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";

import axios from "axios";



export default function Prepwise() {
  const [file, setFile] = useState(null);
  const [mcqCount, setMcqCount] = useState(5);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [result, setResult] = useState(null);
  const [quizId, setQuizId] = useState(null);
  

// Keep previously uploaded file persistent (per user)
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
      const res = await fetch("http://127.0.0.1:5000/api/upload_generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to generate quiz");
        return;
      }

    setQuiz(data.mcqs);       // store the MCQs in state
    setQuizId(data.quiz_id);  // store the quiz ID in state

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
    } catch (err) {
      console.error(err);
      alert("Error generating quiz");
    }
  };

  const handleOptionSelect = (qid, option) => {
    setAnswers({ ...answers, [qid]: option });
  };

  // Submit quiz and calculate results
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

  // Save attempt to backend
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      alert("User not found. Please login again.");
      return;
    }

    const answersArray = quiz.map((q) => answers[q.id]);

    await axios.post(
      `http://127.0.0.1:5000/api/quiz/${quizId}/submit`,
      { user_id: user.id, answers: answersArray }
    );

    console.log("Quiz attempt saved!");

  } catch (err) {
    console.error("Error saving attempt:", err);
    alert("Failed to save quiz attempt.");
  }
};


//   const handleSubmitQuiz = async () => {
//   if (Object.keys(answers).length !== quiz.length) {
//     alert("Please answer all questions before submitting!");
//     return;
//   }

//   let correct = 0;
//   let wrong = 0;
//   const details = [];

//   quiz.forEach((q) => {
//     const selected = answers[q.id];
//     const isCorrect = selected === q.correct;
//     if (isCorrect) correct++;
//     else wrong++;

//     details.push({
//       question: q.question,
//       selected_option: selected,
//       correct_option: q.correct,
//       is_correct: isCorrect,
//     });
//   });

//   setCorrectCount(correct);
//   setWrongCount(wrong);
//   setResult({ details });
//   setSubmitted(true);

//   // ====== NEW ADDITION: Save attempt to backend ======

//   try {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (!user || !user.id) {
//       alert("User not found. Please login again.");
//       return;
//     }

//     // Convert your MCQ format to backend expected index format
//     const answersArray = quiz.map((q) => answers[q.id]);

//     const QuizId = quiz[0].quiz_id || quiz[0].quizId;

//     console.log("QUIZ OBJECT:", quiz);
//     console.log("QUIZ ID:", QuizId);

//     if (!QuizId) {
//       console.error("QuizId missing in quiz data:", quiz);
//       alert("Quiz ID is missing. Cannot save attempt.");
//       return;
//     }
//     // const QuizId = quizId; 

//     // Final POST
//   await axios.post(
//     `http://127.0.0.1:5000/api/quiz/${QuizId}/submit`,
//     {
//       user_id: user.id,
//       answers: answersArray
//     }
//   );

//     console.log("Quiz attempt saved!");

//   } catch (err) {
//     console.error("Error saving attempt:", err);
//   }
// };


  // const handleSubmitQuiz = () => {
  //   if (Object.keys(answers).length !== quiz.length) {
  //     alert("Please answer all questions before submitting!");
  //     return;
  //   }

  //   let correct = 0;
  //   let wrong = 0;
  //   const details = [];

  //   quiz.forEach((q) => {
  //     const selected = answers[q.id];
  //     const isCorrect = selected === q.correct;
  //     if (isCorrect) correct++;
  //     else wrong++;

  //     details.push({
  //       question: q.question,
  //       selected_option: selected,
  //       correct_option: q.correct,
  //       is_correct: isCorrect,
  //     });
  //   });

  //   setCorrectCount(correct);
  //   setWrongCount(wrong);
  //   setResult({ details });
  //   setSubmitted(true);
  // };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setCorrectCount(0);
    setWrongCount(0);
    setResult(null);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">🧠 PrepWise Quiz Generator</h2>

      {/* ---------------- FILE + SETTINGS FORM ---------------- */}
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

          {/* ---------------- SCORE BOX ---------------- */}
          {submitted && (
            <div className="text-center mt-4 card p-3 shadow-sm">
              <h4 className="fw-bold">📊 Quiz Result</h4>
              <p>✅ Correct: {correctCount}</p>
              <p>❌ Wrong: {wrongCount}</p>
              <p>🏆 Score: {correctCount} / {quiz.length}</p>
              <button className="btn btn-primary mt-3 imp_button" onClick={handleRetakeQuiz}>
                Retake Quiz
              </button>

              {/* ---------------- REVIEW BOX ---------------- */}
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
        /* ---------------- QUIZ SECTION ---------------- */
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





















// import React, { useState, useEffect } from "react";

// export default function Prepwise() {
//   const [file, setFile] = useState(null);
//   const [mcqCount, setMcqCount] = useState(5);
//   const [topic, setTopic] = useState("");
//   const [difficulty, setDifficulty] = useState("easy");
//   const [quiz, setQuiz] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [submitted, setSubmitted] = useState(false);
//   // const [score, setScore] = useState(null);
//   const [correctCount, setCorrectCount] = useState(0);
//   const [wrongCount, setWrongCount] = useState(0);

//   const [showResults, setShowResults] = useState(false);
//   const [score, setScore] = useState({ correct: 0, wrong: 0 });
//   const [result, setResult] = useState(null);

//   // 🟢 Keep previously uploaded file persistent
//   useEffect(() => {
//     const storedFile = localStorage.getItem("uploadedFileName");
//     if (storedFile) {
//       setFile({ name: storedFile });
//     }
//   }, []);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     setFile(selectedFile);
//     if (selectedFile) {
//       localStorage.setItem("uploadedFileName", selectedFile.name);
//     }
//   };

//   const handleGenerateQuiz = async (e) => {
//     e.preventDefault();
//     if (!file) {
//       alert("Please upload a study file first!");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);
//     const user = JSON.parse(localStorage.getItem("user"));
//     console.log("User object:", user);
//     if (!user || !user.id) {
//       alert("User not found in localStorage — please log in again.");
//       return;
//     }
//     formData.append("user_id", user?.id);
//     formData.append("num_questions", mcqCount);
//     formData.append("topic", topic);
//     formData.append("difficulty", difficulty);

//     try {
//       const res = await fetch("http://127.0.0.1:5000/api/upload_generate", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         alert(data.error || "Failed to generate quiz");
//         return;
//       }

//       // Ensure proper numbering (1–N)
//       const mapped = data.mcqs.map((m, index) => ({
//         id: index + 1,
//         question: m.question,
//         options: m.options,
//         correct: m.correct, // backend should include this for score check
//       }));

//       setQuiz(mapped);
//       setSubmitted(false);
//       setAnswers({});
//       setScore(null);
//       setCorrectCount(0);
//       setWrongCount(0);
//     } catch (err) {
//       console.error(err);
//       alert("Error generating quiz");
//     }
//   };

//   const handleOptionSelect = (qid, option) => {
//     setAnswers({ ...answers, [qid]: option });
//   };

// const handleSubmitQuiz = () => {
//   if (Object.keys(answers).length !== quiz.length) {
//     alert("Please answer all questions before submitting!");
//     return;
//   }

//   let correct = 0;
//   let wrong = 0;
//   const details = [];

//   quiz.forEach((q) => {
//     const selected = answers[q.id];
//     const isCorrect = selected === q.correct;
//     if (isCorrect) correct++;
//     else wrong++;

//     details.push({
//       question: q.question,
//       selected_option: selected,
//       correct_option: q.correct,
//       is_correct: isCorrect,
//     });
//   });

//   setCorrectCount(correct);
//   setWrongCount(wrong);
//   setResult({ details });
//   setSubmitted(true);
//   setShowResults(true);
// };  

//   const handleRetakeQuiz = () => {
//     setAnswers({});
//     setScore(null);
//     setSubmitted(false);
//     setCorrectCount(0);
//     setWrongCount(0);
//   };

//   return (
//     <div className="container mt-5">
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
//               <label className="form-label fw-bold">Number of MCQs (5–50):</label>
//               <input
//                 type="number"
//                 className="form-control"
//                 min="5"
//                 max="50"
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

//           {submitted && score !== null && (
//             <div className="text-center mt-4 card p-3 shadow-sm">
//               <h4 className="fw-bold">📊 Quiz Result</h4>
//               <p>✅ Correct: {correctCount}</p>
//               <p>❌ Wrong: {wrongCount}</p>
//               <p>🏆 Score: {score} / {quiz.length}</p>
//               <button className="btn btn-primary mt-3 imp_button" onClick={handleRetakeQuiz}>
//                 Retake Quiz
//               </button>
//             </div>
//           )}

//           {quiz.length > 0 && (
//             <div className="mt-6">
//               {quiz.map((q, index) => (
//                 <div key={index} className="mb-4 p-4 border rounded-lg shadow-sm">
//                   <h2 className="font-semibold mb-2">
//                     {index + 1}. {q.question}
//                   </h2>

//         {q.options.map((option, i) => (
//           <div key={i} className="ml-4">
//             <label
//               className={`block cursor-pointer ${
//                 q.selectedOption === option
//                   ? q.correct_answer === option
//                     ? "text-green-600 font-semibold"
//                     : "text-red-600 font-semibold"
//                   : ""
//               }`}
//             >
//               <input
//                 type="radio"
//                 name={`question-${index}`}
//                 value={option}
//                 disabled={showResults}
//                 checked={q.selectedOption === option}
//                 onChange={() => handleOptionSelect(index, option)}
//                 className="mr-2"
//               />
//               {option}
//             </label>
//           </div>
//         ))}
//       </div>
//     )}

//       {result && result.details && (
//       <div className="mt-4 p-4 bg-gray-100 rounded-2xl shadow">
//         <h3 className="text-lg font-semibold mb-2">🔍 Review</h3>
//         {result.details.map((item, index) => (
//           <div
//             key={index}
//             className={`p-2 mb-2 rounded ${
//               item.is_correct ? "bg-green-100" : "bg-red-100"
//             }`}
//           >
//             {!item.is_correct ? (
//               <>
//                 <p className="font-medium text-gray-800">
//                   ❌ {item.question}
//                 </p>
//                 <p className="text-sm text-gray-700">
//                   Your answer: {item.selected_option || "No answer"}
//                 </p>
//                 <p className="text-sm text-gray-700">
//                   Correct answer: {item.correct_option}
//                 </p>
//               </>
//             ) : (
//               <p className="font-medium text-gray-800">
//                 ✅ {item.question}
//               </p>
//             )}
//           </div>
//         ))}
//       </div>
//     )}
//         </div>
//   )}
//       </>
//       {quiz.length > 0 ? (
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
//       ) : (
//         <p className="text-center text-muted mt-4">No quiz loaded yet.</p>
//       )}
//     </div>
//   );
// }



// import React, { useState } from "react";
// // import axios from "axios";


// export default function Prepwise() {
//   const [file, setFile] = useState(null);
//   const [mcqCount, setMcqCount] = useState(5);
//   const [topic, setTopic] = useState("");
//   const [difficulty, setDifficulty] = useState("easy");
//   const [quiz, setQuiz] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [submitted, setSubmitted] = useState(false);
//   const [score, setScore] = useState(null);

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleGenerateQuiz = async (e) => {
//   e.preventDefault();
//   if (!file) {
//     alert("Please upload a study file first!");
//     return;
//   }

//   const formData = new FormData();
//   formData.append("file", file);
//   const user = JSON.parse(localStorage.getItem("user"));
//   console.log("User object:", user);
//   if (!user || !user.id) {
//   alert("User not found in localStorage — please log in again.");
//   return;
// }
//   formData.append("user_id", user?.id);
//   formData.append("num_questions", mcqCount);
//   formData.append("topic", topic);
//   formData.append("difficulty", difficulty);

//   try {
//     const res = await fetch("http://127.0.0.1:5000/api/upload_generate", {
//       method: "POST",
//       body: formData
//     });
//     const data = await res.json();
//     if (!res.ok) {
//       alert(data.error || "Failed to generate quiz");
//       return;
//     }
//     // data.mcqs is array of {id, question, options}
//     const mapped = data.mcqs.map((m) => ({
//       id: m.id,
//       question: m.question,
//       options: m.options
//     }));
//     setQuiz(mapped);
//     setSubmitted(false);
//     setAnswers({});
//     setScore(null);
//   } catch (err) {
//     console.error(err);
//     alert("Error generating quiz");
//   }
// };

//   const handleOptionSelect = (qid, option) => {
//     setAnswers({ ...answers, [qid]: option });
//   };

//   const handleSubmitQuiz = () => {
//     if (Object.keys(answers).length !== quiz.length) {
//       alert("Please answer all questions before submitting!");
//       return;
//     }

//     let correctCount = 0;
//     quiz.forEach((q) => {
//       if (answers[q.id] === q.correct) correctCount++;
//     });

//     setScore(correctCount);
//     setSubmitted(true);
//   };

//   const handleRetakeQuiz = () => {
//     setAnswers({});
//     setScore(null);
//     setSubmitted(false);
//   };

//   return (
//     <div className="container mt-5">
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
//             </div>

//             <div className="mb-3">
//               <label className="form-label fw-bold">Number of MCQs (5–50):</label>
//               <input
//                 type="number"
//                 className="form-control"
//                 min="5"
//                 max="50"
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

//           {submitted && score !== null && (
//             <div className="text-center mt-4">
//               <h4>Your Score: {score} / {quiz.length}</h4>
//               <button className="btn btn-primary mt-3 imp_button" onClick={handleRetakeQuiz}>
//                 Retake Quiz
//               </button>
//             </div>
//           )}
//         </>
//       ) : (
//         <div className="card p-4 shadow-sm">
//           <h4 className="mb-3">Quiz</h4>
//             {quiz.map((q) => (
//                 <div key={q.id} className="mb-4">
//                     <p className="fw-bold">
//                     {q.id}. {q.question}
//                     </p>

//                 {/* Keep this replacement code INSIDE here */}
//                 {q.options.map((opt, i) => (
//                 <label
//                     key={i}
//                     className="d-block p-2 border rounded mb-2"
//                     style={{
//                     cursor: "pointer",
//                     backgroundColor: answers[q.id] === opt ? "#e6ffe6" : "#fff",
//                     }}
//                     >
//                     <input
//                     type="radio"
//                     className="form-check-input me-2"
//                     name={`q-${q.id}`}
//                     checked={answers[q.id] === opt}
//                     onChange={() => handleOptionSelect(q.id, opt)}
//                     style={{ cursor: "pointer" }}
//                     />
//                     {opt}
//                 </label>
//                 ))}
//             </div>
// ))}

//           <button className="btn btn-success w-100 imp_button" onClick={handleSubmitQuiz}>
//             Submit Quiz
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
