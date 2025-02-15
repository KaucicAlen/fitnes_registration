import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/register", { username, password });
      alert("User registered successfully");
      navigate("/login"); // Redirect to login page after registration
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="container">
      <h1>Registriraj se</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Uporabnisko ime"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="geslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Ustvari racun</button>
      </form>
    </div>
  );
};

export default Register;
