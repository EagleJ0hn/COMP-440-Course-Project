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

app.get("/db-test", async (req, res) => {
    try {
        const [rows] = await pool.execute(`SELECT 1 AS connected`);

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

        res.status(400).json({
            success: false,
            message: error.sqlMessage || error.message
        });

    } finally {
        connection.release();
    }
});

app.put("/api/items/:id", requireAuth, async (req, res) => {
    const itemId = req.params.id;
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

        const [items] = await connection.execute(
            `
            SELECT itemId
            FROM items
            WHERE itemId = ?
              AND sellerID = ?
            `,
            [itemId, req.username]
        );

        if (items.length === 0) {
            await connection.rollback();

            return res.status(403).json({
                success: false,
                message: "You can only edit your own items."
            });
        }

        await connection.execute(
            `
            UPDATE items
            SET itemPrice = ?
            WHERE itemId = ?
            `,
            [price, itemId]
        );

        await connection.execute(
            `
            DELETE FROM item_categories
            WHERE itemId = ?
            `,
            [itemId]
        );

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

        res.json({
            success: true,
            message: "Item updated successfully."
        });

    } catch (error) {
        await connection.rollback();

        console.error("Update item error:", error);

        res.status(500).json({
            success: false,
            message: "Could not update the item."
        });

    } finally {
        connection.release();
    }
});

app.delete("/api/items/:id", requireAuth, async (req, res) => {
    const itemId = req.params.id;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [items] = await connection.execute(
            `
            SELECT itemId
            FROM items
            WHERE itemId = ?
              AND sellerID = ?
            `,
            [itemId, req.username]
        );

        if (items.length === 0) {
            await connection.rollback();

            return res.status(403).json({
                success: false,
                message: "You can only delete your own items."
            });
        }

        await connection.execute(
            `
            DELETE FROM item_categories
            WHERE itemId = ?
            `,
            [itemId]
        );

        await connection.execute(
            `
            DELETE FROM reviews
            WHERE itemId = ?
            `,
            [itemId]
        );

        await connection.execute(
            `
            DELETE FROM items
            WHERE itemId = ?
            `,
            [itemId]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Item deleted successfully."
        });

    } catch (error) {
        await connection.rollback();

        console.error("Delete item error:", error);

        res.status(500).json({
            success: false,
            message: "Could not delete the item."
        });

    } finally {
        connection.release();
    }
});

app.post("/api/reviews", requireAuth, async (req, res) =>{
    try{
        const{
            itemId,
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
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.get("/api/reviews", async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                r.reviewId,
                r.itemId,
                r.username,
                r.rating,
                r.comment,
                r.reviewDate,
                i.itemTitle
            FROM reviews AS r
            INNER JOIN items AS i
                ON r.itemId = i.itemId
            ORDER BY r.reviewDate DESC
        `);

        res.json({
            success: true,
            reviews: rows
        });

    } catch (error) {
        console.error("Get reviews error:", error);

        res.status(500).json({
            success: false,
            message: "Could not retrieve reviews."
        });
    }
});

// Query 1: Display most expensive items in each category
app.get("/api/queries/query1", async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                c.categoryName,
                i.itemId,
                i.itemTitle,
                i.itemPrice,
                i.sellerID
            FROM items AS i
            INNER JOIN item_categories AS ic
                ON i.itemId = ic.itemId
            INNER JOIN categories AS c
                ON ic.categoryId = c.categoryId
            WHERE i.itemPrice = (
                SELECT MAX(i2.itemPrice)
                FROM items AS i2
                INNER JOIN item_categories AS ic2
                    ON i2.itemId = ic2.itemId
                WHERE ic2.categoryId = ic.categoryId
            )
            ORDER BY c.categoryName, i.itemPrice DESC
        `);

        res.json({
            success: true,
            items: rows
        });

    } catch (error) {
        console.error("Query 1 error:", error);

        res.status(500).json({
            success: false,
            message: "Could not execute Query 1."
        });
    }
});

// Query 2: Find users who posted at least two different items on the same day
app.get("/api/queries/query2", async (req, res) => {

    const categoryX = String(req.query.categoryX || "")
        .trim()
        .toLowerCase();

    const categoryY = String(req.query.categoryY || "")
        .trim()
        .toLowerCase();

    if (!categoryX || !categoryY) {
        return res.status(400).json({
            success: false,
            message: "Both categories are required."
        });
    }

    try {

        const [rows] = await pool.execute(
            `
            SELECT DISTINCT
                i1.sellerID AS username,
                DATE(i1.datePosted) AS postDate,
                COUNT(DISTINCT i1.itemId) AS itemCount
            FROM items AS i1
            INNER JOIN item_categories AS ic1
                ON i1.itemId = ic1.itemId
            INNER JOIN categories AS c1
                ON ic1.categoryId = c1.categoryId

            INNER JOIN items AS i2
                ON i1.sellerID = i2.sellerID
                AND DATE(i1.datePosted) = DATE(i2.datePosted)
                AND i1.itemId <> i2.itemId

            INNER JOIN item_categories AS ic2
                ON i2.itemId = ic2.itemId
            INNER JOIN categories AS c2
                ON ic2.categoryId = c2.categoryId

            WHERE LOWER(c1.categoryName) = ?
              AND LOWER(c2.categoryName) = ?

            GROUP BY
                i1.sellerID,
                DATE(i1.datePosted)

            ORDER BY
                DATE(i1.datePosted),
                i1.sellerID
            `,
            [categoryX, categoryY]
        );

        res.json({
            success: true,
            users: rows
        });

    } catch (error) {

        console.error("Query 2 error:", error);

        res.status(500).json({
            success: false,
            message: "Could not execute Query 2."
        });
    }
});

//Query 3: Display all items posted by a specified user that has at least one review or has Excellent or Good review
app.get("/api/queries/query3", async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({
            success: false,
            message: "Username is required."
        });
    }

    try {
        const [items] = await pool.execute(
            `
            SELECT
                i.itemId,
                i.itemTitle,
                i.itemDescription,
                i.itemPrice,
                i.datePosted,
                i.sellerID
            FROM items i
            WHERE i.sellerID = ?

              AND EXISTS (
                  SELECT 1
                  FROM reviews r
                  WHERE r.itemId = i.itemId
              )

              AND NOT EXISTS (
                  SELECT 1
                  FROM reviews r
                  WHERE r.itemId = i.itemId
                    AND r.rating NOT IN ('Excellent', 'Good')
              )

            ORDER BY i.itemId
            `,
            [username]
        );

        res.json({
            success: true,
            items
        });

    } catch (error) {
        console.error("Query 3 error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to execute Query 3."
        });
    }
});

// Query 4: Given a date, display the user(s) who posted the most items on that date, along with the number of items they posted. If there is a tie, display all users who posted the maximum number of items.
app.get("/api/queries/query4", async (req, res) => {
    const date = String(req.query.date || "").trim();

    if (!date) {
        return res.status(400).json({
            success: false,
            message: "Date is required."
        });
    }

    try {
        const [rows] = await pool.execute(
            `
            SELECT
                sellerID AS username,
                COUNT(*) AS itemCount
            FROM items
            WHERE DATE(datePosted) = ?
            GROUP BY sellerID
            HAVING COUNT(*) = (
                SELECT MAX(itemCount)
                FROM (
                    SELECT
                        COUNT(*) AS itemCount
                    FROM items
                    WHERE DATE(datePosted) = ?
                    GROUP BY sellerID
                ) AS itemCounts
            )
            ORDER BY sellerID
            `,
            [date, date]
        );

        res.json({
            success: true,
            users: rows
        });

    } catch (error) {
        console.error("Query 4 error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to execute Query 4."
        });
    }
});

// Query 5: Display users who have submitted one or more reviews, and every review they have written is rated Poor.
app.get("/api/queries/query5", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `
            SELECT
                r.username,
                totals.totalReviews,
                r.reviewId,
                r.itemId,
                i.itemTitle,
                r.rating,
                r.comment,
                r.reviewDate
            FROM reviews AS r
            INNER JOIN items AS i
                ON r.itemId = i.itemId
            INNER JOIN (
                SELECT
                    username,
                    COUNT(*) AS totalReviews
                FROM reviews
                GROUP BY username
            ) AS totals
                ON r.username = totals.username
            ORDER BY
                r.username,
                r.reviewDate
            `
        );

        res.json({
            success: true,
            reviews: rows
        });

    } catch (error) {
        console.error("Query 5 error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to execute Query 5."
        });
    }
});

// Query 6: Display users whose posted items have never received a Poor review. Items with no reviews also satisfy this condition.
app.get("/api/queries/query6", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `
            SELECT DISTINCT
                i.sellerID AS username
            FROM items AS i
            WHERE NOT EXISTS (
                SELECT 1
                FROM items AS i2
                INNER JOIN reviews AS r
                    ON i2.itemId = r.itemId
                WHERE i2.sellerID = i.sellerID
                  AND r.rating = 'Poor'
            )
            ORDER BY i.sellerID
            `
        );

        res.json({
            success: true,
            users: rows
        });

    } catch (error) {
        console.error("Query 6 error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to execute Query 6."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

