import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  const [difficultyTrend, setDifficultyTrend] = useState([]);

  const [selectedDifficulties, setSelectedDifficulties] = useState({
    easy: true,
    medium: true,
    hard: true
  });

  // Get logged-in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) setUserId(user.id);
  }, []);

  // Fetch attempts
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://127.0.0.1:5000/api/user/${userId}/attempts`)
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

  // Fetch difficulty trend
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://127.0.0.1:5000/api/user/${userId}/difficulty_trend`)
      .then(res => setDifficultyTrend(res.data))
      .catch(err => console.error(err));
  }, [userId]);

  // Filter last N attempts
  const filteredAttempts = [...attempts]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-filterRange);

  // Overall correct vs wrong
  // const totalCorrect = attempts.reduce((sum, a) => sum + a.correct, 0);
  // const totalWrong = attempts.reduce((sum, a) => sum + a.wrong, 0);
  // const overallData = [
  //   { name: "Correct", value: totalCorrect },
  //   { name: "Wrong", value: totalWrong }
  // ];
  
  // Overall correct vs wrong based on filtered attempts (slider)
  const totalCorrect = filteredAttempts.reduce((sum, a) => sum + a.correct, 0);
  const totalWrong = filteredAttempts.reduce((sum, a) => sum + a.wrong, 0);
  const overallData = [
    { name: "Correct", value: totalCorrect },
    { name: "Wrong", value: totalWrong }
  ];

  const filteredDifficultyTrend = [...difficultyTrend]
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(-filterRange);

  return (
    <div className="performance-tab p-4">
      <h2 className="mb-4" style={{ color: "#3d3989ff" }}>
        Quiz Performance Dashboard
      </h2>

      {/* Slider for last N attempts */}
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


      {/* Line chart for last N attempts */}
      <h4 className="mt-4">Quiz Percentage Over Time</h4>
      <h6 style={{ color: "#3d3989ff" }}>Correct/Total Answers </h6>
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

      {/* Overall Correct vs Wrong Bar Chart */}
      {attempts.length > 0 && (
        <div className="mt-5">
          <h4>
            Overall Correct vs Wrong{" "}
            <h6 style={{ color: "#3d3989ff" }}>Total Across All Quizzes</h6>
          </h4>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overallData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Difficulty Filters */}
      <h4 className="mt-5">Filter Difficulty Levels</h4>
      <div className="d-flex gap-3 mt-3">
        {["easy", "medium", "hard"].map(d => (
          <label key={d}>
            <input
              type="checkbox"
              checked={selectedDifficulties[d]}
              onChange={() =>
                setSelectedDifficulties(prev => ({ ...prev, [d]: !prev[d] }))
              }
            />
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </label>
        ))}
      </div>

      {/* Difficulty Trend Over Time */}
      {difficultyTrend.length > 0 && (
        <div style={{ width: "100%", height: 350 }} className="mt-5">
          <h3>Difficulty Trend Over Time</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredDifficultyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />

              {selectedDifficulties.easy && (
                <Line
                  dataKey="percentage"
                  name="Easy"
                  stroke="#82ca9d"
                  dot={true}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              )}
              {selectedDifficulties.medium && (
                <Line
                  dataKey="percentage"
                  name="Medium"
                  stroke="#8884d8"
                  dot={true}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              )}
              {selectedDifficulties.hard && (
                <Line
                  dataKey="percentage"
                  name="Hard"
                  stroke="#ff6f69"
                  dot={true}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
