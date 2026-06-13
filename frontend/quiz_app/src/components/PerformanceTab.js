import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend
} from "recharts";
import API_URL from '../config';

const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload;
    return (
      <div style={{ background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: "12px", padding: "12px 16px" }}>
        <p style={{ color: "#a0a0b0", fontSize: "12px", margin: "0 0 6px" }}>Date: {label}</p>
        <p style={{ color: "#a0a0b0", fontSize: "12px", margin: "4px 0 0" }}>📄 {d?.filename}</p>
        <p style={{ color: "#d4f542", fontWeight: "700", fontSize: "16px", margin: 0 }}>{d?.percentage?.toFixed(1)}%</p>
        <p style={{ color: "#a0a0b0", fontSize: "12px", margin: "4px 0 0" }}>{d?.correct}/{d?.total} correct</p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: "12px", padding: "12px 16px" }}>
        <p style={{ color: "#ffffff", fontWeight: "600", margin: "0 0 4px" }}>{label}</p>
        <p style={{ color: payload[0]?.fill, fontWeight: "700", fontSize: "18px", margin: 0 }}>{payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

const CustomDiffTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: "12px", padding: "12px 16px", minWidth: "140px" }}>
        <p style={{ color: "#a0a0b0", fontSize: "12px", margin: "0 0 8px" }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.stroke, fontWeight: "600", fontSize: "14px", margin: "2px 0" }}>
            {p.name}: {p.value?.toFixed(1)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: "#1e1e2e",
    border: `1px solid ${accent ? "rgba(212,245,66,0.25)" : "#2a2a3e"}`,
    borderRadius: "14px", padding: "18px 20px", flex: 1, minWidth: "120px"
  }}>
    <p style={{ color: "#a0a0b0", fontSize: "12px", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
    <p style={{ color: accent ? "#d4f542" : "#ffffff", fontSize: "26px", fontWeight: "800", margin: 0 }}>{value}</p>
    {sub && <p style={{ color: "#a0a0b0", fontSize: "12px", margin: "4px 0 0" }}>{sub}</p>}
  </div>
);

const SectionCard = ({ title, subtitle, children }) => (
  <div style={{ background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
    <div style={{ marginBottom: "20px" }}>
      <h3 style={{ color: "#ffffff", fontSize: "17px", fontWeight: "700", margin: 0 }}>{title}</h3>
      {subtitle && <p style={{ color: "#a0a0b0", fontSize: "13px", margin: "4px 0 0" }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

const axisStyle = { fill: "#a0a0b0", fontSize: 11 };
const gridStyle = { stroke: "#2a2a3e", strokeDasharray: "4 4" };

export default function PerformanceTab() {
  const [attempts, setAttempts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [filterRange, setFilterRange] = useState(10);
  const [difficultyTrend, setDifficultyTrend] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState({ easy: true, medium: true, hard: true });

  // ── exact same useEffects and API calls as original ──
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) setUserId(user.id);
  }, []);

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_URL}/api/user/${userId}/attempts`)
      .then(res => {
        const formatted = res.data.map(a => ({
          created_at: a.created_at,
          date: new Date(a.created_at).toLocaleDateString(),
          percentage: a.percentage,
          correct: a.correct,
          wrong: a.wrong,
          total: a.total,
          filename: a.filename
        }));
        setAttempts(formatted);
      })
      .catch(err => console.error(err));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_URL}/api/user/${userId}/difficulty_trend`)
      .then(res => setDifficultyTrend(res.data))
      .catch(err => console.error(err));
  }, [userId]);

  // ── exact same data transforms as original ──
  const filteredAttempts = [...attempts]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-filterRange);

  const totalCorrect = filteredAttempts.reduce((sum, a) => sum + a.correct, 0);
  const totalWrong = filteredAttempts.reduce((sum, a) => sum + a.wrong, 0);
  const avgScore = filteredAttempts.length
    ? (filteredAttempts.reduce((s, a) => s + a.percentage, 0) / filteredAttempts.length).toFixed(1)
    : 0;

  const overallData = [
    { name: "Correct", value: totalCorrect },
    { name: "Wrong", value: totalWrong }
  ];

  // ── FIX for chart 3: pivot { date, difficulty, percentage } → { date, easy, medium, hard } ──
  // Your backend returns rows like { date, difficulty, percentage }
  // All 3 lines were using dataKey="percentage" so they drew on top of each other — this fixes it
  const filteredDifficultyTrend = (() => {
    const sorted = [...difficultyTrend]
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const map = {};
    sorted.forEach(row => {
      const d = row.date;
      if (!map[d]) map[d] = { date: d };
      if (row.difficulty) {
        map[d][row.difficulty.toLowerCase()] = row.percentage;
      } else {
        Object.assign(map[d], row); // already pivoted, pass through
      }
    });
    return Object.values(map).slice(-filterRange);
  })();

  const diffColors = { easy: "#82ca9d", medium: "#d4f542", hard: "#ff6b6b" };

  const emptyState = (
    <div style={{ textAlign: "center", padding: "48px 0", color: "#a0a0b0" }}>
      <div style={{ fontSize: "36px", marginBottom: "10px" }}>📊</div>
      <p style={{ fontSize: "15px", fontWeight: "500" }}>No quiz attempts yet</p>
      <p style={{ fontSize: "13px" }}>Take a quiz to see your performance here</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#0f0f1a", minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ color: "#ffffff", fontSize: "26px", fontWeight: "800", margin: 0 }}>Performance Dashboard</h1>
          <p style={{ color: "#a0a0b0", fontSize: "14px", margin: "6px 0 0" }}>Track your quiz results and improvement over time</p>
        </div>

        {attempts.length > 0 && (
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
            <StatCard label="Total Quizzes" value={attempts.length} />
            <StatCard label="Avg Score" value={`${avgScore}%`} accent />
            <StatCard label="Total Correct" value={totalCorrect} sub="across selected range" />
            <StatCard label="Total Wrong" value={totalWrong} sub="across selected range" />
          </div>
        )}

        {attempts.length > 0 && (
          <div style={{
            background: "#1e1e2e", border: "1px solid #2a2a3e",
            borderRadius: "14px", padding: "18px 24px", marginBottom: "20px",
            display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap"
          }}>
            <span style={{ color: "#a0a0b0", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" }}>Show last</span>
            <input
              type="range" min="1" max={attempts.length} value={filterRange}
              onChange={e => setFilterRange(Number(e.target.value))}
              style={{ flex: 1, minWidth: "120px", accentColor: "#d4f542" }}
            />
            <div style={{
              background: "rgba(212,245,66,0.1)", border: "1px solid rgba(212,245,66,0.25)",
              borderRadius: "8px", padding: "4px 14px", color: "#d4f542", fontWeight: "800", fontSize: "16px"
            }}>
              {filterRange} {filterRange === 1 ? "quiz" : "quizzes"}
            </div>
          </div>
        )}

        {/* Chart 1 */}
        <SectionCard title="Quiz Score Over Time" subtitle="Percentage correct across your recent attempts">
          {filteredAttempts.length === 0 ? emptyState : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredAttempts}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis domain={[0, 100]} tick={axisStyle} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomLineTooltip />} />
                <Line type="monotone" dataKey="percentage" stroke="#d4f542" strokeWidth={2.5}
                  dot={{ r: 4, fill: "#d4f542", strokeWidth: 0 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Chart 2 */}
        {attempts.length > 0 && (
          <SectionCard title="Correct vs Wrong Answers" subtitle="Totals across the selected quiz range">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={overallData} barSize={56}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}
                  fill="#d4f542"
                  // color each bar individually
                  label={false}
                  isAnimationActive={true}
                >
                  {overallData.map((_, index) => (
                    <rect key={index} fill={index === 0 ? "#d4f542" : "#ff6b6b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        )}

        {/* Chart 3 — fixed */}
        <SectionCard title="Difficulty Trend Over Time" subtitle="Track how you perform across Easy, Medium, and Hard quizzes">
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            {["easy", "medium", "hard"].map(d => (
              <button key={d}
                onClick={() => setSelectedDifficulties(prev => ({ ...prev, [d]: !prev[d] }))}
                style={{
                  padding: "6px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                  cursor: "pointer", border: `1px solid ${selectedDifficulties[d] ? diffColors[d] : "#3a3a4e"}`,
                  background: selectedDifficulties[d] ? `${diffColors[d]}18` : "#2a2a3e",
                  color: selectedDifficulties[d] ? diffColors[d] : "#a0a0b0"
                }}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          {filteredDifficultyTrend.length === 0 ? emptyState : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredDifficultyTrend}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis domain={[0, 100]} tick={axisStyle} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomDiffTooltip />} />
                <Legend wrapperStyle={{ color: "#a0a0b0", fontSize: "13px", paddingTop: "12px" }} />
                {selectedDifficulties.easy && (
                  <Line dataKey="easy" name="Easy" stroke={diffColors.easy} strokeWidth={2.5}
                    dot={{ r: 4, fill: diffColors.easy, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                )}
                {selectedDifficulties.medium && (
                  <Line dataKey="medium" name="Medium" stroke={diffColors.medium} strokeWidth={2.5}
                    dot={{ r: 4, fill: diffColors.medium, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                )}
                {selectedDifficulties.hard && (
                  <Line dataKey="hard" name="Hard" stroke={diffColors.hard} strokeWidth={2.5}
                    dot={{ r: 4, fill: diffColors.hard, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

      </div>
    </div>
  );
}

