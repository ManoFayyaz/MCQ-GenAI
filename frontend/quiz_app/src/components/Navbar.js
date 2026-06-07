import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Container, Nav } from "react-bootstrap";
import {
  Brain,
  LayoutDashboard,
  Info,
  User,
  BarChart2,
  LogOut,
  LogIn,
  UserPlus
} from "lucide-react";

function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("uploadedFileName");
    setUser(null);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar className="custom-navbar" expand="lg">
      <Container>
        <Navbar.Brand
          as={Link}
          to={user ? "/prepwise" : "/"}
        >
          <Brain size={22} style={{ marginRight: 8, color: "#d4f542", verticalAlign: "middle" }} />
          <span style={{ color: "#d4f542", fontFamily: "Raleway, sans-serif", fontWeight: 800 }}>
            PrepWise
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {user ? (
              <>
                <Nav.Link
                  as={Link}
                  to="/prepwise"
                  className={isActive("/prepwise") ? "active" : ""}
                >
                  <LayoutDashboard size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Quiz
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/performance"
                  className={isActive("/performance") ? "active" : ""}
                >
                  <BarChart2 size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Performance
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/profile"
                  className={isActive("/profile") ? "active" : ""}
                >
                  <User size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Profile
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/about"
                  className={isActive("/about") ? "active" : ""}
                >
                  <Info size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  About
                </Nav.Link>

                <Nav.Link
                  onClick={handleLogout}
                  style={{ cursor: "pointer" }}
                >
                  <LogOut size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/"
                  className={isActive("/") ? "active" : ""}
                >
                  <LogIn size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Login
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/register"
                  className={isActive("/register") ? "active" : ""}
                >
                  <UserPlus size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Register
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/about"
                  className={isActive("/about") ? "active" : ""}
                >
                  <Info size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  About
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;

// import React, { useState, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { Navbar, Container, Nav } from "react-bootstrap";
// // import PerformanceTab from "./PerformanceTab";


// function AppNavbar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

//   // Re-check localStorage every time the route changes
//   useEffect(() => {
//     setUser(JSON.parse(localStorage.getItem("user")));
//   }, [location]);

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("uploadedFileName");
//     setUser(null);
//     navigate("/");
//   };

//   return (
//     <Navbar className="custom-navbar" expand="lg">
//       <Container>
//         <Navbar.Brand
//           as={Link}
//           to={user ? "/prepwise" : "/"}
//           style={{ fontFamily: "Raleway, sans-serif", fontWeight: "800" }}
//         >
//           <b>Prep Wise</b>
//         </Navbar.Brand>
//         <Navbar.Toggle aria-controls="basic-navbar-nav" />
//         <Navbar.Collapse id="basic-navbar-nav">
//           <Nav className="ms-auto">
//             {user ? (
//               <>
//                 <Nav.Link as={Link} to="/prepwise">Quiz</Nav.Link>
//                 <Nav.Link as={Link} to="/about">About</Nav.Link>
//                 <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
//                 <Nav.Link as={Link} to="/performance">Performance</Nav.Link>
//                 <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
//               </>
//             ) : (
//               <>
//                 <Nav.Link as={Link} to="/">Login</Nav.Link>
//                 <Nav.Link as={Link} to="/register">Register</Nav.Link>
//                 <Nav.Link as={Link} to="/about">About</Nav.Link>
//               </>
//             )}
//           </Nav>
//         </Navbar.Collapse>
//       </Container>
//     </Navbar>
//   );
// }

// export default AppNavbar;