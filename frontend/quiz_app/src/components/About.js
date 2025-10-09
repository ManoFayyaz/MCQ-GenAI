import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="container mt-5">
      <div className="row align-items-center">
        
    

        <div className="col-md-6">
          <h2 className="fw-bold mb-3">
             
            <span style={{ color: "purple" }}>PrepWise</span>
          </h2>

          <p>
            PrepWise is an interactive learning platform that helps students prepare for quizzes 
            and exams effectively using AI-powered question generation.
          </p>

          <p>
            Upload your notes, PDFs, or textbooks — and PrepWise converts them into engaging 
            quizzes so you can test your understanding instantly.
          </p>

        <div style={{ lineHeight: "1.8" }}>
            <li>Upload study materials easily</li> 
            <li>enerate AI-based quizzes</li>
            <li>Track your progress</li>
          </div>

          <Link to="/" className="btn btn-success mt-3">Get Started</Link>
        </div>

      </div>
    </div>
  );
}
