"use strict";

const query1Button = document.getElementById("query1Button");
const query2Button = document.getElementById("query2Button");
const query3Button = document.getElementById("query3Button");

const queryResultList = document.getElementById("queryResultList");

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