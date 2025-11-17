import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function PerformanceTab() {
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState(null);

  // Get logged-in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) setUserId(user.id);
  }, []);

  // Fetch attempts
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://127.0.0.1:5000/api/user/${userId}/quiz_attempts`)
      .then((res) => {
        const attempts = res.data || [];

        // Group attempts by quiz_id
        const grouped = {};
        attempts.forEach(a => {
          if (!grouped[a.quiz_id]) grouped[a.quiz_id] = [];
          grouped[a.quiz_id].push({
            date: new Date(a.created_at).toLocaleDateString(),
            percentage: a.percentage,
            correct: a.correct_count,
            total: a.correct_count + a.wrong_count
          });
        });

        // Transform into array
        const groupedArr = Object.keys(grouped).map(quiz_id => ({
          quiz_id,
          attempts: grouped[quiz_id]
        }));

        setData(groupedArr);
      })
      .catch(err => console.error("Failed to fetch attempts:", err));
  }, [userId]);

  return (
    <div className="performance-tab p-4">
      <h2 className="mb-4">Your Quiz Performance</h2>
      {data.length === 0 && <p>No quizzes attempted yet.</p>}

      {data.map((quiz) => (
        <div key={quiz.quiz_id} className="mb-5">
          <h4>Quiz ID: {quiz.quiz_id}</h4>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              {quiz.attempts && quiz.attempts.length > 0 ? (
                <LineChart data={quiz.attempts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value, name, props) => {
                      if (!props?.payload) return [value, name];
                      const { payload } = props;
                      return [`${payload.correct}/${payload.total}`, "Correct / Total"];
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    name="Score (%)"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              ) : (
                <p>No attempts yet.</p>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}












// import React from "react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// const testData = [
//   { date: "2025-11-01", percentage: 50 },
//   { date: "2025-11-02", percentage: 70 },
//   { date: "2025-11-03", percentage: 90 },
// ];

// export default function TestChart() {
//   return (
//     <div style={{ width: 800, height: 300 }}>
//       <ResponsiveContainer width="100%" height="100%">
//         <LineChart data={testData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="date" />
//           <YAxis domain={[0, 100]} />
//           <Tooltip />
//           <Line type="monotone" dataKey="percentage" stroke="#8884d8" />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
