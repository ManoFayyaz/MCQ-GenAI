import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import PrepWise from './components/PrepWise';
import AppNavbar from './components/Navbar';
import About  from './components/About';
import PerformanceTab from './components/PerformanceTab';
import { QuizProvider } from "./context/QuizContext";
import ProfilePage from './components/ProfilePage';

function App() {
  return (
    <Router>
      <AppNavbar />  
            <QuizProvider>
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path='/about' element={<About />}/>
                  <Route path="/prepwise" element={<PrepWise />} />
                  <Route path="/performance" element={<PerformanceTab />} />
                  <Route path="/profile" element={<ProfilePage />} />  

                </Routes>
              </QuizProvider>   
              </Router>
           
  );
}
// element={<PerformanceTab userId={JSON.parse(localStorage.getItem("user")).id} />
export default App;
