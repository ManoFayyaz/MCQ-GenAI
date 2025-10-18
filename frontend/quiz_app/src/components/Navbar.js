import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav } from "react-bootstrap";

function AppNavbar() {
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("uploadedFileName"); // clear stored file
    navigate("/"); // go to login page
  };

  return (
    <Navbar className="custom-navbar" expand="lg">
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          style={{ fontFamily: "Raleway, sans-serif", fontWeight: "800" }}
        >
          <b>Prep Wise</b>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* If user is logged in */}
            {user ? (
              <>
                <Nav.Link as={Link} to="/prepwise">Quiz</Nav.Link>
                <Nav.Link as={Link} to="/about">About</Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              // If user is not logged in
              <>
                <Nav.Link as={Link} to="/">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                <Nav.Link as={Link} to="/about">About</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;




// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Navbar, Container, Nav } from 'react-bootstrap';

// function AppNavbar() {
//   return (
//     <Navbar className="custom-navbar" expand="lg">
//     <Container>
//         <Navbar.Brand 
//         as={Link} 
//         to="/" 
//         style={{ fontFamily: "Raleway, sans-serif", fontWeight: '800' }}
//         >
//         <b>Prep Wise</b>
//         </Navbar.Brand>
//         <Navbar.Toggle aria-controls="basic-navbar-nav" />
//         <Navbar.Collapse id="basic-navbar-nav">
//         <Nav className="ms-auto">
//             <Nav.Link as={Link} to="/">Login</Nav.Link>
//             <Nav.Link as={Link} to="/register">Register</Nav.Link>
//             <Nav.Link as={Link} to="/about">About</Nav.Link>
//             <Nav.Link as={Link} to="/prepwise">Quiz</Nav.Link>
//         </Nav>
//         </Navbar.Collapse>
//     </Container>
// </Navbar>

//   );
// }

// export default AppNavbar;
