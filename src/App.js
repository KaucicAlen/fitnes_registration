import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Calendar from "./components/Calendar";
import Header from "./components/Header";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null); 
    setUsername(null); 
    navigate("/login"); 
  };

  return (
    <Router>
      <div className="container">
        <Header token={token} username={username} handleLogout={handleLogout} />

        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setToken={setToken} setUsername={setUsername} />} />
          <Route path="/calendar" element={<Calendar token={token} />} />
          <Route path="/" element={<Login setToken={setToken} setUsername={setUsername} />} />
          <Route path="404" element={<Login setToken={setToken} setUsername={setUsername} />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
