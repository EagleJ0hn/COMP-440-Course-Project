"use strict";

const query1Button = document.getElementById("query1Button");
const query2Button = document.getElementById("query2Button");
const query3Button = document.getElementById("query3Button");
const query2Inputs = document.getElementById("query2Inputs");
const runQuery2Button = document.getElementById("runQuery2Button");
const query3Inputs = document.getElementById("query3Inputs");
const runQuery3Button = document.getElementById("runQuery3Button");

const query4Button = document.getElementById("query4Button");
const query4Inputs = document.getElementById("query4Inputs");
const query4Date = document.getElementById("query4Date");
const runQuery4Button = document.getElementById("runQuery4Button");
const query5Button = document.getElementById("query5Button");
const query6Button = document.getElementById("query6Button");

const username = document.getElementById("username");

const queryDescription = document.getElementById("queryDescription");

const queryResultList = document.getElementById("queryResultList");
const categoryX = document.getElementById("categoryX");
const categoryY = document.getElementById("categoryY");

function resetQueryDisplay() {
    query2Inputs.style.display = "none";
    query3Inputs.style.display = "none";
    query4Inputs.style.display = "none";

    queryResultList.replaceChildren();
}

// Query 1
query1Button.addEventListener("click", async () => {
    resetQueryDisplay();
    queryDescription.textContent =
        "Query 1: Displays the most expensive item(s) in each category.";

    try {
        const response = await fetch("/api/queries/query1");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        queryResultList.replaceChildren();

        if (result.items.length === 0) {
            const message = document.createElement("p");
            message.textContent = "No items found.";
            queryResultList.appendChild(message);
            return;
        }

        for (const item of result.items) {
            const article = document.createElement("article");
            article.className = "card";

            const title = document.createElement("h3");
            title.textContent = item.itemTitle;

            const category = document.createElement("p");
            category.textContent =
                `Category: ${item.categoryName}`;

            const price = document.createElement("p");
            price.textContent =
                `Price: $${Number(item.itemPrice).toFixed(2)}`;

            const seller = document.createElement("p");
            seller.textContent =
                `Seller: ${item.sellerID}`;

            article.appendChild(title);
            article.appendChild(category);
            article.appendChild(price);
            article.appendChild(seller);

            queryResultList.appendChild(article);
        }

    } catch (error) {
        console.error("Query 1 error:", error);

        queryResultList.replaceChildren();

        const message = document.createElement("p");
        message.textContent = error.message;

        queryResultList.appendChild(message);
    }
});

// Query 2
query2Button.addEventListener("click", () => {
    resetQueryDisplay();
    queryDescription.textContent =
        "Query 2: Finds users who posted different items in two specified categories on the same day.";

    query2Inputs.style.display = "block";
});

runQuery2Button.addEventListener("click", async () => {
    const categoryXValue = categoryX.value.trim().toLowerCase();
    const categoryYValue = categoryY.value.trim().toLowerCase();

    if (!categoryXValue || !categoryYValue) {
        queryResultList.textContent =
            "Please enter both categories.";
        return;
    }

    try {
        const response = await fetch(
            `/api/queries/query2?categoryX=${encodeURIComponent(categoryXValue)}&categoryY=${encodeURIComponent(categoryYValue)}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        queryResultList.replaceChildren();

        if (result.users.length === 0) {
            queryResultList.textContent =
                "No users found.";
            return;
        }

        for (const user of result.users) {
            const paragraph = document.createElement("p");

            paragraph.textContent =
                `${user.username} posted ${user.itemCount} qualifying items.`;

            queryResultList.appendChild(paragraph);
        }

    } catch (error) {
        console.error("Query 2 error:", error);

        queryResultList.textContent =
            error.message;
    }
});

// Query 3
query3Button.addEventListener("click", () => {
    resetQueryDisplay();
    queryDescription.textContent =
        "Query 3: Displays items posted by a specified user that have only Excellent or Good reviews.";
    
    query3Inputs.style.display = "block";
});

runQuery3Button.addEventListener("click", async () => {
    const usernameValue = username.value.trim();

    if (!usernameValue) {
        queryResultList.textContent =
            "Please enter a username.";
        return;
    }

    try {
        const response = await fetch(
            `/api/queries/query3?username=${encodeURIComponent(usernameValue)}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        queryResultList.replaceChildren();

        if (result.items.length === 0) {
            queryResultList.textContent =
                "No qualifying items found.";
            return;
        }

        for (const item of result.items) {
            const article = document.createElement("article");
            article.className = "card";

            const title = document.createElement("h3");
            title.textContent = item.itemTitle;

            const description = document.createElement("p");
            description.textContent =
                item.itemDescription || "No description";

            const price = document.createElement("p");
            price.textContent =
                `Price: $${Number(item.itemPrice).toFixed(2)}`;

            const seller = document.createElement("p");
            seller.textContent =
                `Seller: ${item.sellerID}`;

            const date = document.createElement("p");
            date.textContent =
                `Posted: ${new Date(item.datePosted).toLocaleString()}`;

            article.appendChild(title);
            article.appendChild(description);
            article.appendChild(price);
            article.appendChild(seller);
            article.appendChild(date);

            queryResultList.appendChild(article);
        }

    } catch (error) {
        console.error("Query 3 error:", error);

        queryResultList.textContent =
            error.message;
    }
});

// Query 4
query4Button.addEventListener("click", () => {
    resetQueryDisplay();
    queryDescription.textContent =
        "Query 4: Displays the user(s) who posted the largest number of items on a selected date.";
   
        query4Inputs.style.display = "block";
});

runQuery4Button.addEventListener("click", async () => {
    const dateValue = query4Date.value;

    if (!dateValue) {
        queryResultList.textContent =
            "Please select a date.";
        return;
    }

    try {
        const response = await fetch(
            `/api/queries/query4?date=${encodeURIComponent(dateValue)}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        queryResultList.replaceChildren();

        if (result.users.length === 0) {
            queryResultList.textContent =
                "No users posted items on this date.";
            return;
        }

        for (const user of result.users) {
            const paragraph = document.createElement("p");

            paragraph.textContent =
                `${user.username} posted ${user.itemCount} items.`;

            queryResultList.appendChild(paragraph);
        }

    } catch (error) {
        console.error("Query 4 error:", error);

        queryResultList.textContent =
            error.message;
    }
});

// Query 5
query5Button.addEventListener("click", async () => {
    resetQueryDisplay();
    queryDescription.textContent =
        "Query 5: Displays users who have written reviews, their total number of reviews, and their Poor reviews.";

    try {
        const response = await fetch("/api/queries/query5");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        queryResultList.replaceChildren();

        if (result.reviews.length === 0) {
            queryResultList.textContent =
                "No users have submitted reviews.";
            return;
        }

        // Group reviews by username
        const users = {};

        for (const review of result.reviews) {
            if (!users[review.username]) {
                users[review.username] = {
                    totalReviews: review.totalReviews,
                    poorReviews: []
                };
            }

            if (review.rating === "Poor") {
                users[review.username].poorReviews.push(review);
            }
        }

        // Display each user
        for (const [username, data] of Object.entries(users)) {
            const article = document.createElement("article");
            article.className = "card";

            const userHeading = document.createElement("h3");
            userHeading.textContent = `User: ${username}`;

            const total = document.createElement("p");
            total.textContent =
                `Total Reviews: ${data.totalReviews}`;

            article.appendChild(userHeading);
            article.appendChild(total);

            // Poor reviews
            if (data.poorReviews.length > 0) {
                const poorHeading = document.createElement("h4");
                poorHeading.textContent = "Poor Reviews:";

                article.appendChild(poorHeading);

                for (const review of data.poorReviews) {
                    const item = document.createElement("p");
                    item.textContent =
                        `Item: ${review.itemTitle}`;

                    const comment = document.createElement("p");
                    comment.textContent =
                        `Comment: ${review.comment}`;

                    article.appendChild(item);
                    article.appendChild(comment);
                }

            } else {
                const message = document.createElement("p");
                message.textContent = "No Poor reviews.";

                article.appendChild(message);
            }

            queryResultList.appendChild(article);
        }

    } catch (error) {
        console.error("Query 5 error:", error);

        queryResultList.textContent =
            error.message;
    }
});

// Query 6
query6Button.addEventListener("click", async () => {
    resetQueryDisplay();
    queryDescription.textContent =
        "Query 6: Displays users whose posted items have never received a Poor review.";

    try {
        const response = await fetch("/api/queries/query6");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        queryResultList.replaceChildren();

        if (result.users.length === 0) {
            queryResultList.textContent =
                "No users found.";
            return;
        }

        for (const user of result.users) {
            const paragraph = document.createElement("p");

            paragraph.textContent =
                `${user.username} has never received a Poor review.`;

            queryResultList.appendChild(paragraph);
        }

    } catch (error) {
        console.error("Query 6 error:", error);

        queryResultList.textContent =
            error.message;
    }
});