import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import PrepWise from './components/PrepWise';
import AppNavbar from './components/Navbar';
import About  from './components/About';

function App() {
  return (
    <Router>
      <AppNavbar />  
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/about' element={<About />}/>
        <Route path="/prepwise" element={<PrepWise />} />
      </Routes>
    </Router>
  );
}

export default App;
