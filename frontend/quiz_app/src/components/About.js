import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Brain, ClipboardList, BarChart2, ChevronRight, BookOpen, Settings2, Eye } from 'lucide-react';

function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatPill({ value, label, suffix = "" }) {
  const count = useCounter(value);
  return (
    <div style={{
      background: "rgba(212,245,66,0.06)", border: "1px solid rgba(212,245,66,0.18)",
      borderRadius: "16px", padding: "20px 24px", textAlign: "center", flex: 1, minWidth: "110px"
    }}>
      <p style={{ color: "#d4f542", fontSize: "32px", fontWeight: "900", margin: 0, lineHeight: 1 }}>{count}{suffix}</p>
      <p style={{ color: "#a0a0b0", fontSize: "12px", margin: "6px 0 0", textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</p>
    </div>
  );
}

function StepCard({ number, icon: Icon, title, desc, color }) {
  return (
    <div style={{ background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: "16px", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-10px", right: "14px", fontSize: "72px", fontWeight: "900", color: "rgba(255,255,255,0.03)", lineHeight: 1, userSelect: "none" }}>{number}</div>
      <div style={{ width: "44px", height: "44px", background: `${color}18`, border: `1px solid ${color}40`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ background: `${color}18`, color, border: `1px solid ${color}30`, borderRadius: "6px", fontSize: "11px", fontWeight: "700", padding: "2px 8px", display: "inline-block", marginBottom: "10px", letterSpacing: "0.5px" }}>
        STEP {number}
      </div>
      <h3 style={{ color: "#ffffff", fontSize: "16px", fontWeight: "700", margin: "0 0 8px" }}>{title}</h3>
      <p style={{ color: "#a0a0b0", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>{desc}</p>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, desc }) {
  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "16px 0", borderBottom: "1px solid #2a2a3e" }}>
      <div style={{ width: "36px", height: "36px", flexShrink: 0, background: "rgba(212,245,66,0.08)", border: "1px solid rgba(212,245,66,0.2)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color="#d4f542" />
      </div>
      <div>
        <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", margin: "0 0 3px" }}>{title}</p>
        <p style={{ color: "#a0a0b0", fontSize: "13px", margin: 0, lineHeight: "1.5" }}>{desc}</p>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <div style={{ backgroundColor: "#0f0f1a", minHeight: "100vh", padding: "48px 20px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(212,245,66,0.08)", border: "1px solid rgba(212,245,66,0.25)", borderRadius: "20px", padding: "6px 16px", marginBottom: "20px" }}>
            <Brain size={13} color="#d4f542" />
            <span style={{ color: "#d4f542", fontSize: "12px", fontWeight: "700", letterSpacing: "0.8px", textTransform: "uppercase" }}>AI-Powered Study Platform</span>
          </div>
          <h1 style={{ color: "#ffffff", fontSize: "clamp(32px, 6vw, 54px)", fontWeight: "900", lineHeight: 1.1, margin: "0 0 18px" }}>
            Study smarter with <span style={{ color: "#d4f542" }}>PrepWise</span>
          </h1>
          <p style={{ color: "#a0a0b0", fontSize: "17px", lineHeight: "1.7", maxWidth: "580px", margin: "0 auto 32px" }}>
            Upload your notes, textbooks, or PDFs — PrepWise instantly converts them into personalized MCQ quizzes powered by AI, so you can test your understanding on your own schedule.
          </p>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#d4f542", color: "#0f0f1a", borderRadius: "12px", padding: "13px 28px", fontWeight: "800", fontSize: "15px", textDecoration: "none" }}>
            Get Started <ChevronRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "48px" }}>
          <StatPill value={30} suffix="+" label="Max MCQs per quiz" />
          <StatPill value={3} label="Difficulty levels" />
          <StatPill value={100} suffix="%" label="AI-generated" />
          <StatPill value={24} suffix="/7" label="Available" />
        </div>

        {/* What is PrepWise */}
        <div style={{ background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: "20px", padding: "32px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <BookOpen size={18} color="#d4f542" />
            <h2 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "800", margin: 0 }}>What is PrepWise?</h2>
          </div>
          <p style={{ color: "#a0a0b0", fontSize: "15px", lineHeight: "1.75", margin: "0 0 14px" }}>
            PrepWise is a Final Year Project built to revolutionize how students study for exams and entry tests. Instead of passively reading notes, you actively test yourself through AI-generated MCQs tailored to your own material.
          </p>
          <p style={{ color: "#a0a0b0", fontSize: "15px", lineHeight: "1.75", margin: 0 }}>
            Whether you're preparing for university exams, entry tests, or professional certifications — PrepWise turns any document into an interactive practice session in seconds.
          </p>
        </div>

        {/* Features */}
        <div style={{ background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: "20px", padding: "32px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <Settings2 size={18} color="#d4f542" />
            <h2 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "800", margin: 0 }}>What you can do</h2>
          </div>
          <div style={{ marginTop: "4px" }}>
            <FeatureRow icon={Upload} title="Upload your study material" desc="Supports PDFs, notes, and documents. PrepWise extracts and understands the content for you." />
            <FeatureRow icon={Brain} title="AI generates MCQs instantly" desc="Our AI reads your material and crafts relevant multiple-choice questions — no manual input needed." />
            <FeatureRow icon={Settings2} title="Customize your quiz" desc="Choose difficulty (Easy / Medium / Hard), set how many questions (5–30), and optionally focus on a specific topic." />
            <FeatureRow icon={ClipboardList} title="Solve at your own pace" desc="Take the quiz whenever you're ready. Review and revisit your answers freely." />
            <FeatureRow icon={BarChart2} title="Track your performance" desc="See your scores over time, correct vs wrong breakdowns, and difficulty-wise progress trends." />
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingTop: "16px" }}>
              <div style={{ width: "36px", height: "36px", flexShrink: 0, background: "rgba(212,245,66,0.08)", border: "1px solid rgba(212,245,66,0.2)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Eye size={16} color="#d4f542" />
              </div>
              <div>
                <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", margin: "0 0 3px" }}>See detailed results</p>
                <p style={{ color: "#a0a0b0", fontSize: "13px", margin: 0, lineHeight: "1.5" }}>After each quiz, review which answers were right or wrong with full explanations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* How to use */}
        <div style={{ background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: "20px", padding: "32px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <ClipboardList size={18} color="#d4f542" />
            <h2 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "800", margin: 0 }}>How to use PrepWise</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <StepCard number={1} icon={Upload} color="#a8d8f0" title="Upload your material" desc="Go to the PrepWise tab and upload a PDF or paste your study notes." />
            <StepCard number={2} icon={Settings2} color="#d4f542" title="Configure your quiz" desc="Pick difficulty level, number of MCQs (5–30), and an optional topic to focus on." />
            <StepCard number={3} icon={Brain} color="#c084fc" title="AI generates questions" desc="PrepWise reads your material and generates tailored MCQs using AI." />
            <StepCard number={4} icon={ClipboardList} color="#82ca9d" title="Take the quiz" desc="Solve the MCQs at your own pace and submit when you're done." />
            <StepCard number={5} icon={BarChart2} color="#ff6b6b" title="Review & track" desc="See your score, review answers, and track your progress in the Performance tab." />
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "linear-gradient(135deg, rgba(212,245,66,0.08), rgba(212,245,66,0.03))", border: "1px solid rgba(212,245,66,0.2)", borderRadius: "20px", padding: "36px", textAlign: "center" }}>
          <h2 style={{ color: "#ffffff", fontSize: "22px", fontWeight: "800", margin: "0 0 10px" }}>Ready to ace your exams?</h2>
          <p style={{ color: "#a0a0b0", fontSize: "14px", margin: "0 0 24px" }}>Upload your first document and generate a quiz in under 30 seconds.</p>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#d4f542", color: "#0f0f1a", borderRadius: "12px", padding: "13px 32px", fontWeight: "800", fontSize: "15px", textDecoration: "none" }}>
            Start now <ChevronRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}


// import React from 'react';
// import { Link } from 'react-router-dom';

// export default function About() {
//   return (
//     <div className="container mt-5">
//       <div className="row align-items-center">
        
    

//         <div className="col-md-6">
//           <h2 className="fw-bold mb-3">
             
//             <span style={{ color: "purple" }}>PrepWise</span>
//           </h2>

//           <p>
//             PrepWise is an interactive learning platform that helps students prepare for quizzes 
//             and entry test exams effectively using AI-powered question generation.
//           </p>

//           <p>
//             Upload your notes, PDFs, or textbooks and PrepWise converts them into engaging 
//             quizzes so you can test your understanding instantly.<br/><br/>
//             You can also explain a specific topic to the AI, generate your desired number of MCQs with easy medium or difficult MCQs criteria.

//           </p>

//         <div style={{ lineHeight: "1.1" }}>
//             <p>Upload study materials easily</p> 
//             <p>Generate AI-based quizzes</p>
//             <p>Track your progress</p>
//           </div>

//           <Link to="/" className="btn btn-success mt-3 imp_button">Get Started</Link>
//         </div>

//       </div>
//     </div>
//   );
// }
