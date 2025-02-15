import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ setToken, setUsername }) => {
  const [username, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in by checking localStorage
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/calendar");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("https://fitnesregistration-production.up.railway.app/login", {
        username,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);

      // Update the state for the parent component
      setToken(token);
      setUsername(username);

      // Redirect to calendar page after successful login
      navigate("/calendar");
    } catch (err) {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="login-container">
      <h1>Prijavi se</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Uporabnisko ime"
          value={username}
          onChange={(e) => setUsernameInput(e.target.value)}
        />
        <input
          type="password"
          placeholder="geslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Prijava</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
