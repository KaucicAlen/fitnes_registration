import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ token, username }) => {
  
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null); 
    setUsername(null); 
    navigate("/login"); 
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
