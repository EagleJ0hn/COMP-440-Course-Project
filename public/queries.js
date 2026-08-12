"use strict";

const query1Button = document.getElementById("query1Button");
const query2Button = document.getElementById("query2Button");
const query3Button = document.getElementById("query3Button");
const query2Inputs = document.getElementById("query2Inputs");
const runQuery2Button = document.getElementById("runQuery2Button");
const query3Inputs = document.getElementById("query3Inputs");
const runQuery3Button = document.getElementById("runQuery3Button");
const username = document.getElementById("username");

const queryResultList = document.getElementById("queryResultList");
const categoryX = document.getElementById("categoryX");
const categoryY = document.getElementById("categoryY");

// Query 1
query1Button.addEventListener("click", async () => {
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