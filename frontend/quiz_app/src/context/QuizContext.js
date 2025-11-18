import { createContext, useContext, useState } from "react";

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [result, setResult] = useState(null);
  const [quizId, setQuizId] = useState(null);

  return (
    <QuizContext.Provider
      value={{
        quiz, setQuiz,
        answers, setAnswers,
        submitted, setSubmitted,
        correctCount, setCorrectCount,
        wrongCount, setWrongCount,
        result, setResult,
        quizId, setQuizId
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => useContext(QuizContext);
