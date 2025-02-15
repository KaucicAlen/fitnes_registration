import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Calendar from "./components/Calendar";
import Header from "./components/Header";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  

  return (
    <Router>
      <div className="container">
        <Header token={token} username={username} handleLogout={handleLogout} />

        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setToken={setToken} setUsername={setUsername} />} />
          <Route path="/calendar" element={<Calendar token={token} />} />
          <Route path="/" element={<Login setToken={setToken} setUsername={setUsername} />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
