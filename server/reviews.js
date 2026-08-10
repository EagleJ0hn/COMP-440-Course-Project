"use strict";

const pool = require("../db");

const VALID_RATINGS = [
    "Excellent",
    "Good",
    "Fair",
    "Poor"
];

async function createReview(username, itemId, rating, comment) {

    // Check that the rating is valid
    if (!VALID_RATINGS.includes(rating)) {
        throw new Error(
            "Rating must be Excellent, Good, Fair, or Poor."
        );
    }

    // Check that the item exists
    const [items] = await pool.execute(
        `
        SELECT itemId, sellerID
        FROM items
        WHERE itemId = ?
        `,
        [itemId]
    );

    if (items.length === 0) {
        throw new Error("Item does not exist.");
    }

    // Prevent users from reviewing their own item
    if(items[0].sellerID === username){
        throw new Error("You cannot review your own item.")
    }

    const [existingReviews] = await pool.execute(
        `
        SELECT reviewId
        FROM reviews
        WHERE username = ? AND itemId = ?
        `,
        [username, itemId]
    );

    if (existingReviews.length > 0) {
    throw new Error("You have already reviewed this item.");
    }

    // Insert the review
    const [result] = await pool.execute(
        `
        INSERT INTO reviews (
            username,
            itemId,
            rating,
            comment
        )
        VALUES (?, ?, ?, ?)
        `,
        [username, itemId, rating, comment]
    );
    return result.insertId;
}

module.exports = {
    createReview
};