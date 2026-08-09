require("dotenv").config();

const { registerUser, loginUser } = require("./server/auth");
const { validateInput } = require("./server/validation");
const {createSession, requireAuth, logout } = require("./server/authSession");
const {createReview } = require("./server/reviews");

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

// Check if the server is connected to MySQL
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
    const token = createSession(username);
    res.setHeader(
        "Set-Cookie",
        `sessionToken=${token}; HttpOnly; Path=/; SameSite=Strict`
    );

    res.status(200).json(result);

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "An error occurred during login."
        });
    }
});

app.post("/api/logout", (req, res) =>{
    logout(req);

    res.setHeader(
        "Set-Cookie",
        "sessionToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict"
    );

    res.json({
        success: true,
        message: "Logged out successfully."
    });
});

app.get("/api/me", requireAuth, (req, res) => {
    res.json({
        success: true,
        username: req.username
    });
});

app.get("/api/items", async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                i.itemId,
                i.itemTitle,
                i.itemDescription,
                i.itemPrice,
                i.datePosted,
                i.sellerID,
                COALESCE(
                    GROUP_CONCAT(
                        DISTINCT c.categoryName
                        ORDER BY c.categoryName
                        SEPARATOR ','
                    ),
                    ''
                ) AS categories
            FROM items AS i
            LEFT JOIN item_categories AS ic
                ON i.itemId = ic.itemId
            LEFT JOIN categories AS c
                ON ic.categoryId = c.categoryId
            GROUP BY
                i.itemId,
                i.itemTitle,
                i.itemDescription,
                i.itemPrice,
                i.datePosted,
                i.sellerID
            ORDER BY i.datePosted DESC
        `);

        res.json({
            success: true,
            items: rows
        });
    } catch (error) {
        console.error("Get items error:", error);

        res.status(500).json({
            success: false,
            message: "Could not retrieve items."
        });
    }
});

app.get("/api/items/mine", requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `
            SELECT
                i.itemId,
                i.itemTitle,
                i.itemDescription,
                i.itemPrice,
                i.datePosted,
                i.sellerID,
                COALESCE(
                    GROUP_CONCAT(
                        DISTINCT c.categoryName
                        ORDER BY c.categoryName
                        SEPARATOR ','
                    ),
                    ''
                ) AS categories
            FROM items AS i
            LEFT JOIN item_categories AS ic
                ON i.itemId = ic.itemId
            LEFT JOIN categories AS c
                ON ic.categoryId = c.categoryId
            WHERE i.sellerID = ?
            GROUP BY
                i.itemId,
                i.itemTitle,
                i.itemDescription,
                i.itemPrice,
                i.datePosted,
                i.sellerID
            ORDER BY i.datePosted DESC
            `,
            [req.username]
        );

        res.json({
            success: true,
            items: rows
        });
    } catch (error) {
        console.error("Get my items error:", error);

        res.status(500).json({
            success: false,
            message: "Could not retrieve your items."
        });
    }
});

app.get("/api/items/search", async (req, res) => {
    const category = String(req.query.category || "")
        .trim()
        .toLowerCase();

    if (!category) {
        return res.status(400).json({
            success: false,
            message: "A category is required."
        });
    }

    try {
        const [rows] = await pool.execute(
            `
            SELECT
                i.itemId,
                i.itemTitle,
                i.itemDescription,
                i.itemPrice,
                i.datePosted,
                i.sellerID,
                COALESCE(
                    GROUP_CONCAT(
                        DISTINCT allCategories.categoryName
                        ORDER BY allCategories.categoryName
                        SEPARATOR ','
                    ),
                    ''
                ) AS categories
            FROM items AS i
            INNER JOIN item_categories AS searchedItems
                ON i.itemId = searchedItems.itemId
            INNER JOIN categories AS searchedCategory
                ON searchedItems.categoryId = searchedCategory.categoryId
            LEFT JOIN item_categories AS allItemCategories
                ON i.itemId = allItemCategories.itemId
            LEFT JOIN categories AS allCategories
                ON allItemCategories.categoryId = allCategories.categoryId
            WHERE LOWER(searchedCategory.categoryName) = ?
            GROUP BY
                i.itemId,
                i.itemTitle,
                i.itemDescription,
                i.itemPrice,
                i.datePosted,
                i.sellerID
            ORDER BY i.datePosted DESC
            `,
            [category]
        );

        res.json({
            success: true,
            items: rows
        });
    } catch (error) {
        console.error("Search items error:", error);

        res.status(500).json({
            success: false,
            message: "Could not search for items."
        });
    }
});

app.post("/api/items", requireAuth, async (req, res) => {
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();
    const price = Number(req.body.price);

    let submittedCategories = req.body.categories;

    if (typeof submittedCategories === "string") {
        submittedCategories = submittedCategories.split(",");
    }

    if (!Array.isArray(submittedCategories)) {
        submittedCategories = [];
    }

    const categories = [
        ...new Set(
            submittedCategories
                .map(category => String(category).trim().toLowerCase())
                .filter(Boolean)
        )
    ];

    if (!title || title.length > 100) {
        return res.status(400).json({
            success: false,
            message: "Title must contain between 1 and 100 characters."
        });
    }

    if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid price greater than zero."
        });
    }

    if (categories.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Enter at least one category."
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [itemResult] = await connection.execute(
            `
            INSERT INTO items (
                itemTitle,
                itemDescription,
                itemPrice,
                sellerID
            )
            VALUES (?, ?, ?, ?)
            `,
            [title, description || null, price, req.username]
        );

        const itemId = itemResult.insertId;

        for (const categoryName of categories) {
            await connection.execute(
                `
                INSERT INTO categories (categoryName)
                VALUES (?)
                ON DUPLICATE KEY UPDATE
                    categoryName = VALUES(categoryName)
                `,
                [categoryName]
            );

            const [categoryRows] = await connection.execute(
                `
                SELECT categoryId
                FROM categories
                WHERE categoryName = ?
                `,
                [categoryName]
            );

            await connection.execute(
                `
                INSERT INTO item_categories (itemId, categoryId)
                VALUES (?, ?)
                `,
                [itemId, categoryRows[0].categoryId]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Item added successfully.",
            itemId
        });
    } catch (error) {
        await connection.rollback();
        console.error("Add item error:", error);

        res.status(500).json({
            success: false,
            message: "Could not add the item."
        });
    } finally {
        connection.release();
    }
});

app.post("/api/reviews", requireAuth, async (req, res) =>{
    try{
        const{
            itenId,
            rating,
            comment
        } = req.body;
        if (!itemId || !rating || !comment){
            return res.status(400).json({
                success: false,
                message: "Item, rating, and comment are required."
            });
        }
        const reviewId = await createReview(
            req.username,
            itemId,
            rating,
            comment
        );
        res.status(201).json({
            success: true,
            message: "Review submitted successfully.",
            reviewId
        });
    } catch (error){
        console.error("Create review error:", error);
        res.status(500).json({
            success: false,
            message: "Could not submit review."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});