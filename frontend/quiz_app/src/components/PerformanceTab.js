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
const [attempts, setAttempts] = useState([]);
const [userId, setUserId] = useState(null);
const [filterRange, setFilterRange] = useState(10);

useEffect(() => {
const user = JSON.parse(localStorage.getItem("user"));
if (user && user.id) setUserId(user.id);
}, []);

useEffect(() => {
if (!userId) return;

axios.get(`http://127.0.0.1:5000/api/user/${userId}/attempts`)
  .then(res => {
    const formatted = res.data.map(a => ({
      created_at: a.created_at,
      date: new Date(a.created_at).toLocaleDateString(),
      percentage: a.percentage,
      correct: a.correct,
      wrong: a.wrong,
      total: a.total
    }));
    setAttempts(formatted);
  })
  .catch(err => console.error(err));

}, [userId]);

const filteredAttempts = [...attempts]
.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
.slice(-filterRange);

return ( <div className="performance-tab p-4"> <h2 className="mb-4">Your Overall Quiz Performance</h2>

  {attempts.length > 0 && (
    <div className="mb-3">
      <label className="me-2 fw-bold">Show Last Quiz Attempts:</label>
      <input
        type="range"
        min="1"
        max={attempts.length}
        value={filterRange}
        onChange={e => setFilterRange(Number(e.target.value))}
      />
      <span className="ms-2">{filterRange}</span>
    </div>
  )}

  {filteredAttempts.length === 0 ? (
    <p>No quiz attempts yet.</p>
  ) : (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filteredAttempts}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip
            formatter={(value, name, props) => {
              const { payload } = props;
              return [`${payload.correct}/${payload.total}`, "Correct / Total"];
            }}
            labelFormatter={label => `Date: ${label}`}
          />
          <Line type="monotone" dataKey="percentage" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )}
</div>

);
}





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
//   const [attempts, setAttempts] = useState([]);
//   const [userId, setUserId] = useState(null);

//   // Get logged-in user
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user && user.id) setUserId(user.id);
//   }, []);

//   // Fetch all attempts for the user
//   useEffect(() => {
//     if (!userId) return;

//     axios
//       .get(`http://127.0.0.1:5000/api/user/${userId}/attempts`)
//       .then((res) => {
//         // Map the data to a format suitable for Recharts
//         const formatted = res.data.map((a) => ({
//           date: new Date(a.created_at).toLocaleDateString(),
//           percentage: a.percentage,
//           correct: a.correct,
//           wrong: a.wrong,
//           total: a.total
//         }));
//         setAttempts(formatted);
//       })
//       .catch((err) => console.error("Failed to fetch attempts:", err));
//   }, [userId]);

//   return (
//     <div className="performance-tab p-4">
//       <h2 className="mb-4">Your Overall Quiz Performance</h2>
//       {attempts.length === 0 ? (
//         <p>No quiz attempts yet.</p>
//       ) : (
//         <div style={{ width: "100%", height: 400 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={attempts}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis domain={[0, 100]} />
//               <Tooltip
//                 formatter={(value, name, props) => {
//                   const { payload } = props;
//                   return [`${payload.correct}/${payload.total}`, "Correct / Total"];
//                 }}
//                 labelFormatter={(label) => `Date: ${label}`}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="percentage"
//                 name="Score (%)"
//                 stroke="#8884d8"
//                 strokeWidth={2}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       )}
//     </div>
//   );
// }







