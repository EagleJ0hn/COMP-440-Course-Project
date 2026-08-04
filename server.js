require("dotenv").config();

const { registerUser, loginUser } = require("./server/auth");
const { validateInput } = require("./server/validation");
const {createSession, requireAuth } = require("./server/authSession");

const express = require("express");
const path = require("path");
const pool = require("./db");
const { register } = require("module");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/db-test", async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT 1 AS connected");

        res.json({
            message: "Connected to MySQL",
            result: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Could not connect to MySQL");
    }
});

app.post("/api/register", async (req, res) => {
    try{
        // Validate the input data
        const validation = validateInput(req.body);

        if (!validation.valid) {
            return res.status(400).json(validation);
        }

        // Register the user
        const result = await registerUser(req.body);

        if (!result.success){
            return res.status(409).json(result);
        }

        res.status(201).json(result);
    
    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "An error occured during registration."
        });
    }
})

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Make sure the login fields were provided
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
    }

    //Authenticate the user
    const result = await loginUser(username, password);

    if (!result.success) {
        return res.status(401).json(result);
    }

    res.status(200).json(result);
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "An error occurred during login."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});