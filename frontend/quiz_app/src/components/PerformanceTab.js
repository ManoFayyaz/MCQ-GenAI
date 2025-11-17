// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer
// } from "recharts";

// export default function PerformanceTab() {
//   const [data, setData] = useState([]);
//   const [userId, setUserId] = useState(null);

//   // Get logged-in user
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user && user.id) setUserId(user.id);
//   }, []);

//   // Fetch quiz attempts
//   useEffect(() => {
//     if (!userId) return;

//     axios
//       .get(`http://127.0.0.1:5000/api/user/${userId}/quiz_attempts`)
//       .then((res) => {
//         const attempts = res.data; // array of { quiz_id, correct_count, wrong_count, percentage, created_at }

//         // Group attempts by quiz_id
//         const grouped = {};
//         attempts.forEach(a => {
//           if (!grouped[a.quiz_id]) grouped[a.quiz_id] = [];
//           grouped[a.quiz_id].push({
//             date: new Date(a.created_at).toLocaleDateString(),
//             percentage: a.percentage,
//             correct: a.correct_count,
//             total: a.correct_count + a.wrong_count
//           });
//         });

//         // Transform into array for rendering
//         const groupedArr = Object.keys(grouped).map(quiz_id => ({
//           quiz_id,
//           attempts: grouped[quiz_id]
//         }));

//         setData(groupedArr);
//       })
//       .catch(err => console.error("Failed to fetch attempts:", err));
//   }, [userId]);

//   return (
//     <div className="performance-tab p-4">
//       <h2 className="mb-4">Your Quiz Performance</h2>
//       {data.length === 0 && <p>No quizzes attempted yet.</p>}

//       {data.map((quiz) => (
//         <div key={quiz.quiz_id} className="mb-5">
//           <h4>Quiz ID: {quiz.quiz_id}</h4>

//           {quiz.attempts && quiz.attempts.length > 0 ? (
//             <div style={{ width: "100%", height: 300 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={quiz.attempts}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="date" />
//                   <YAxis domain={[0, 100]} />
//                   <Tooltip
//                     formatter={(value, name, props) => {
//                       const { payload } = props || {};
//                       if (!payload) return [value, name];
//                       return [`${payload.correct}/${payload.total}`, "Correct / Total"];
//                     }}
//                     labelFormatter={(label) => `Date: ${label}`}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="percentage"
//                     name="Score (%)"
//                     stroke="#8884d8"
//                     strokeWidth={2}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <p>No attempts yet.</p>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }






// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import {
// //   LineChart,
// //   Line,
// //   XAxis,
// //   YAxis,
// //   Tooltip,
// //   CartesianGrid,
// //   ResponsiveContainer
// // } from "recharts";

// // export default function PerformanceTab() {
// //   const [data, setData] = useState([]);
// //   const [userId, setUserId] = useState(null);

// //   // Get logged-in user
// //   useEffect(() => {
// //     const user = JSON.parse(localStorage.getItem("user"));
// //     if (user && user.id) setUserId(user.id);
// //   }, []);

// //   // Fetch attempts
// //   useEffect(() => {
// //     if (!userId) return;

// //     axios
// //       .get(`http://127.0.0.1:5000/api/user/${userId}/quiz_attempts`)
// //       .then((res) => {
// //         const attempts = res.data; // array of { quiz_id, correct_count, wrong_count, percentage, created_at }

// //         // Group attempts by quiz_id
// //         const grouped = {};
// //         attempts.forEach(a => {
// //           if (!grouped[a.quiz_id]) grouped[a.quiz_id] = [];
// //           grouped[a.quiz_id].push({
// //             date: new Date(a.created_at).toLocaleDateString(),
// //             percentage: a.percentage,
// //             correct: a.correct_count,
// //             total: a.correct_count + a.wrong_count
// //           });
// //         });

// //         // Transform into array
// //         const groupedArr = Object.keys(grouped).map(quiz_id => ({
// //           quiz_id,
// //           attempts: grouped[quiz_id]
// //         }));

// //         setData(groupedArr);
// //       })
// //       .catch(err => console.error("Failed to fetch attempts:", err));
// //   }, [userId]);

// //   return (
// //     <div className="performance-tab p-4">
// //       <h2 className="mb-4">Your Quiz Performance</h2>
// //       {data.length === 0 && <p>No quizzes attempted yet.</p>}

// //       {data.map((quiz) => (
// //         <div key={quiz.quiz_id} className="mb-5">
// //           <h4>Quiz ID: {quiz.quiz_id}</h4>

// //           {quiz.attempts.length === 0 ? (
// //             <p>No attempts yet.</p>
// //           ) : (
// //             <div style={{ width: 800, height: 300 }}>
// //               <ResponsiveContainer height="100%" width="100%">
// //                   {quiz.attempts && quiz.attempts.length > 0 ? (
// //                     <LineChart data={quiz.attempts}>
// //                       <CartesianGrid strokeDasharray="3 3" />
// //                       <XAxis dataKey="date" />
// //                       <YAxis domain={[0, 100]} />
// //                       <Tooltip
// //                         formatter={(value, name, props) => {
// //                           if (!props || !props.payload) return [value, name];
// //                           const { payload } = props;
// //                           return [`${payload.correct}/${payload.total}`, "Correct / Total"];
// //                         }}
// //                         labelFormatter={(label) => `Date: ${label}`}
// //                       />
// //                       <Line
// //                         type="monotone"
// //                         dataKey="percentage"
// //                         name="Score (%)"
// //                         stroke="#8884d8"
// //                         strokeWidth={2}
// //                       />
// //                     </LineChart>
// //                   ) : null}
// //             </ResponsiveContainer>

// //             </div>
// //           )}
// //         </div>
// //       ))}
// //     </div>
// //   );
// // }
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function TestChart() {
  const data = [
    { date: "2025-11-15", percentage: 50, correct: 3, total: 6 },
    { date: "2025-11-16", percentage: 80, correct: 4, total: 5 },
    { date: "2025-11-17", percentage: 100, correct: 5, total: 5 }
  ];

  return (
    <div style={{ width: "600px", height: "300px", border: "1px solid black" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip
            formatter={(value, name, props) => {
              const { payload } = props || {};
              if (!payload) return [value, name];
              return [`${payload.correct}/${payload.total}`, "Correct / Total"];
            }}
          />
          <Line type="monotone" dataKey="percentage" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
