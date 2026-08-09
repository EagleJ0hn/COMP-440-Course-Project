"use strict";

const pool = require("../db");

async function createReview(username, itemId, rating, comment){
    const [result] = await pool.execute(
        `
        Insert into reviews(
            username,
            itemId,
            rating,
            comment
    )
    Values (?, ?, ?, ?)
    `,
    [username, itemId, rating, comment]
    );
    return result.insertId;
}

module.exports = {
    createReview
};