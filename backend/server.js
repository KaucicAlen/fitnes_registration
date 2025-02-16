require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2"); 
const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    reconnnect: true,
});

db.on("error", (err) => {
    console.error("Database Error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("Reconnecting to database...");
      db.connect();
    }
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
            return res.status(401).json({ message: "Vasa seja je potekla, prosim da se ponovno prijavite." });
        }
        req.user = decoded; // Save the decoded user info for later use
        next();
    });
};

// User registration
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        // Hash the password using argon2
        const hash = await argon2.hash(password);

        db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "User registered" });
        });
    } catch (err) {
        return res.status(500).json({ error: "Error hashing password" });
    }
});

// User login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(400).json({ message: "Uporabnik ne obstaja" });

        const user = results[0];

        try {
            // Compare the password with the hashed one using argon2
            const isValid = await argon2.verify(user.password, password);
            if (!isValid) {
                return res.status(401).json({ message: "Napačno geslo" });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, "secret", { expiresIn: "1h" });
            res.json({ token });
        } catch (err) {
            return res.status(500).json({ message: "Napaka pri preverjanju gesla, poskusite pozneje" });
        }
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
            return res.status(400).json({ message: "Ta ura je ze zasedena." });
        }

        // Insert reservation into the database
        db.query("INSERT INTO reservations (day, hour, user_id) VALUES (?, ?, ?)", [day, hour, userId], (err, result) => {
            if (err) return res.status(500).json({ message: "Problem pri rezervaciji, poskusite pozneje." });

            // Fetch username to return to frontend
            db.query("SELECT username FROM users WHERE id = ?", [userId], (err, userResult) => {
                if (err) return res.status(500).json({ message: "Error fetching user info" });
                res.json({ message: "Rezervacija termina uspesna!", username: userResult[0].username });
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
            return res.status(403).json({ message: "Preklices lahko samo svoje rezervacije." });
        }

        // Delete the reservation
        const deleteQuery = "DELETE FROM reservations WHERE day = ? AND hour = ? AND user_id = ?";
        db.query(deleteQuery, [day, hour, userId], (err) => {
            if (err) return res.status(500).json({ message: "Problem pri brisanju rezervacije, poskusite pozneje." });

            res.json({ message: "Rezervacija uspesno preklicana." });
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
