import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ token, username, setToken, setUsername }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear token and username from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    
    // Redirect to login page
    navigate("/login");
    
    // Refresh the page
    window.location.reload();
};

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Fitnes soba</Link>
      </div>
      <div className="user-info">
        {token ? (
          <>
            <span>Pozdravljen/a, {username}! </span>
            <button className="logout-button" onClick={handleLogout}>Odjavi se!</button>
          </>
        ) : (
          <span>
            <Link to="/login">Prijava</Link> | <Link to="/register">Registracija</Link>
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;
