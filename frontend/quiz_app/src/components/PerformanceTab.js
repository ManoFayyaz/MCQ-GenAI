import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

export default function PerformanceTab({ userId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!userId) return;
    axios.get(`/api/user/${userId}/performance`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [userId]);

  return (
    <div className="performance-tab p-4">
      <h2 className="mb-4">Your Study Material Progress</h2>
      {data.length === 0 && <p>No quizzes attempted yet.</p>}

      {data.map(material => (
        <div key={material.upload_id} className="mb-5">
          <h4>{material.material_name} (Average: {material.average_score}%)</h4>
          {material.attempts.length === 0 ? (
            <p>No attempts yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={material.attempts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" name="Score (%)" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      ))}
    </div>
  );
}






















// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function PerformanceTab() {
//   const [data, setData] = useState([]);
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user && user.id) setUserId(user.id);
//   }, []);

//   useEffect(() => {
//     if (!userId) return;

//     axios.get(`/api/user/${userId}/performance`)
//       .then((res) => setData(res.data))
//       .catch((err) => console.error("Failed to fetch performance:", err));
//   }, [userId]);

//   return (
//     <div className="performance-tab p-4">
//       <h2 className="mb-4">Your Quiz Performance</h2>
//       {data.length === 0 && <p>No quizzes attempted yet.</p>}
//       {data.map((quiz) => (
//         <div key={quiz.quiz_id} className="quiz-performance border p-3 mb-3 rounded">
//           <h5>{quiz.topic || "Untitled Quiz"} ({quiz.difficulty})</h5>
//           <p>Last Score: {quiz.last_percentage ?? "N/A"}%</p>
//           <p>Total Questions: {quiz.num_questions}</p>
//           <p><strong>AI Study Tip:</strong> {quiz.ai_suggestion ?? "No tip yet."}</p>

//           {quiz.attempt_history.length > 0 && (
//             <div>
//               <h6>Attempts History:</h6>
//               <ul>
//                 {quiz.attempt_history.map((a, idx) => (
//                   <li key={idx}>
//                     {new Date(a.created_at).toLocaleString()} - Correct: {a.correct_count}, Wrong: {a.wrong_count}, %: {a.percentage}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }
















