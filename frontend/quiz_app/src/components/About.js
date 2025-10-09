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
            Upload your notes, PDFs, or textbooks and PrepWise converts them into engaging 
            quizzes so you can test your understanding instantly.<br/><br/>
            You can also explain a specific topic to the AI, generate your desired number of MCQs with easy medium or difficult MCQs criteria.

          </p>

        <div style={{ lineHeight: "1.1" }}>
            <p>Upload study materials easily</p> 
            <p>Generate AI-based quizzes</p>
            <p>Track your progress</p>
          </div>

          <Link to="/" className="btn btn-success mt-3 imp_button">Get Started</Link>
        </div>

      </div>
    </div>
  );
}
