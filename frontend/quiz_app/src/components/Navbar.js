import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';

function AppNavbar() {
  return (
    <Navbar className="custom-navbar" expand="lg">
    <Container>
        <Navbar.Brand 
        as={Link} 
        to="/" 
        style={{ fontFamily: "Raleway, sans-serif", fontWeight: '800' }}
        >
        <b>Prep Wise</b>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Login</Nav.Link>
            <Nav.Link as={Link} to="/register">Register</Nav.Link>
            <Nav.Link as={Link} to="/prepwise">Quiz</Nav.Link>
        </Nav>
        </Navbar.Collapse>
    </Container>
</Navbar>

  );
}

export default AppNavbar;
