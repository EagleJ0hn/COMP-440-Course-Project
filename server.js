require("dotenv").config();

const express = require("express");
const path = require("path");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});