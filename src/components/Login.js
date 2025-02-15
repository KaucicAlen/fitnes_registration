import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ setToken, setUsername }) => {
  const [username, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("fitnesregistration-production.up.railway.app/login", {
        username,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      setToken(token);
      setUsername(username);
      navigate("/calendar");
    } catch (err) {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="login-container">
      <h2>Prijavi se</h2>
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
