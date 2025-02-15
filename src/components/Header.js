import { Link } from "react-router-dom";

const Header = ({ token, username, handleLogout }) => {
  return (
    <header>
      <h1>Fitness Reservation</h1>
      <nav>
        {token ? (
          <>
            <span>Welcome, {username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
