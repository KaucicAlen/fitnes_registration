require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());
require("dotenv").config(); 

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to the database.");
});

app.get("/", (req, res) => {
    res.send("Server is running");
});


// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(token, "secret", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        req.user = decoded; // Save the decoded user info for later use
        next();
    });
};

// User registration
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);

    db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "User registered" });
    });
});

// User login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(400).json({ message: "User not found" });

        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, "secret", { expiresIn: "1h" });
        res.json({ token });
    });
});


// Get all reservations for the logged-in user
app.get("/reservations", verifyToken, (req, res) => {
    const query = "SELECT day, hour FROM reservations WHERE user_id = ?";
    db.query(query, [req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result); // Return both day and hour
    });
});

// Make a reservation
app.post("/reserve", verifyToken, (req, res) => {
    const { day, hour } = req.body;
    const userId = req.user.id;

    if (!day || !hour) {
        return res.status(400).json({ message: "Day and hour are required." });
    }

    // Check if the time slot is already reserved for that day
    db.query("SELECT * FROM reservations WHERE day = ? AND hour = ?", [day, hour], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length > 0) {
            return res.status(400).json({ message: "This time block is already reserved." });
        }

        // Insert reservation into the database
        db.query("INSERT INTO reservations (day, hour, user_id) VALUES (?, ?, ?)", [day, hour, userId], (err, result) => {
            if (err) return res.status(500).json({ message: "Error reserving block" });

            // Fetch username to return to frontend
            db.query("SELECT username FROM users WHERE id = ?", [userId], (err, userResult) => {
                if (err) return res.status(500).json({ message: "Error fetching user info" });
                res.json({ message: "Reservation successful", username: userResult[0].username });
            });
        });
    });
});

// Remove reservation
app.delete("/removeReservation/:day/:hour", verifyToken, (req, res) => {
    const { day, hour } = req.params;
    const userId = req.user.id;

    // Check if the logged-in user made the reservation
    const checkQuery = "SELECT * FROM reservations WHERE day = ? AND hour = ? AND user_id = ?";
    db.query(checkQuery, [day, hour, userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Error checking reservation" });

        if (results.length === 0) {
            return res.status(403).json({ message: "You can only remove your own reservations" });
        }

        // Delete the reservation
        const deleteQuery = "DELETE FROM reservations WHERE day = ? AND hour = ? AND user_id = ?";
        db.query(deleteQuery, [day, hour, userId], (err) => {
            if (err) return res.status(500).json({ message: "Error removing reservation" });

            res.json({ message: "Reservation removed successfully" });
        });
    });
});

// Fetch all reservations with usernames
app.get("/getReservations", verifyToken, (req, res) => {
    const query = `
        SELECT r.day, r.hour, u.username 
        FROM reservations r
        JOIN users u ON r.user_id = u.id
    `; // Now includes 'day' along with 'hour' and 'username'

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching reservations:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results); // Send reservation data with usernames
    });
});



// Start server
app.listen(5001, () => {
    console.log("Server running on port 5001");
});
