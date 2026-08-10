"use strict";

const allItemsList = document.getElementById("allItemsList");
const myItemsList = document.getElementById("myItemsList");
const searchResults = document.getElementById("searchResults");

const addItemSection = document.getElementById("add-item");
const myItemsSection = document.getElementById("my-items");

const addItemForm = document.getElementById("addItemForm");
const searchForm = document.getElementById("searchForm");
const messageElement = document.getElementById("message");

let currentUsername = null;

function showMessage(message, isError = false) {
    messageElement.textContent = message;
    messageElement.className = isError ? "error" : "success";
}

function clearMessage() {
    messageElement.textContent = "";
    messageElement.className = "";
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = String(value ?? "");
    return element.innerHTML;
}

function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number(price));
}

function formatDate(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(parsedDate);
}

function renderItems(container, items) {
    container.replaceChildren();

    if (!Array.isArray(items) || items.length === 0) {
        const paragraph = document.createElement("p");
        paragraph.textContent = "No items found.";
        container.appendChild(paragraph);
        return;
    }

    for (const item of items) {
        const article = document.createElement("article");
        article.className = "card";

        const categoryList = item.categories
            ? String(item.categories)
                  .split(",")
                  .map(category => category.trim())
                  .filter(Boolean)
            : [];

        article.innerHTML = `
            <h3>${escapeHtml(item.itemTitle)}</h3>
            <p>${escapeHtml(item.itemDescription || "No description")}</p>
            <p><strong>Price:</strong> ${escapeHtml(
                formatPrice(item.itemPrice)
            )}</p>
            <p><strong>Seller:</strong> ${escapeHtml(item.sellerID)}</p>
            <p>
                <strong>Categories:</strong>
                ${escapeHtml(categoryList.join(", ") || "None")}
            </p>
            <small>
                Posted ${escapeHtml(formatDate(item.datePosted))}
            </small>
        `;
        
        const reviewButton = document.createElement("button");
        reviewButton.textContent = "Review Item";

        reviewButton.addEventListener("click", () => {
            window.location.href = `/reviews.html?itemId=${item.itemId}`;
        });

        article.appendChild(reviewButton);

        container.appendChild(article);
    }
}

async function apiRequest(url, options = {}) {
    const headers = {
        Accept: "application/json",
        ...options.headers
    };

    if (options.body) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: "same-origin"
    });

    let data;

    try {
        data = await response.json();
    } catch {
        data = {
            success: false,
            message: "The server returned an invalid response."
        };
    }

    if (!response.ok) {
        throw new Error(data.message || "The request failed.");
    }

    return data;
}

async function checkAuthentication() {
    try {
        const result = await apiRequest("/api/me");

        currentUsername = result.username;

        addItemSection.classList.remove("hidden");
        myItemsSection.classList.remove("hidden");
    } catch {
        currentUsername = null;

        addItemSection.classList.add("hidden");
        myItemsSection.classList.add("hidden");
    }
}

async function loadAllItems() {
    try {
        const result = await apiRequest("/api/items");
        renderItems(allItemsList, result.items);
    } catch (error) {
        renderItems(allItemsList, []);
        showMessage(error.message, true);
    }
}

async function loadMyItems() {
    if (!currentUsername) {
        renderItems(myItemsList, []);
        return;
    }

    try {
        const result = await apiRequest("/api/items/mine");
        renderItems(myItemsList, result.items);
    } catch (error) {
        renderItems(myItemsList, []);
        showMessage(error.message, true);
    }
}

addItemForm.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage();

    if (!currentUsername) {
        showMessage("You must log in before adding an item.", true);
        return;
    }

    const formData = new FormData(addItemForm);

    const categories = String(formData.get("categories") || "")
        .split(",")
        .map(category => category.trim().toLowerCase())
        .filter(Boolean);

    const item = {
        title: String(formData.get("title") || "").trim(),
        description: String(formData.get("description") || "").trim(),
        price: Number(formData.get("price")),
        categories
    };

    try {
        const result = await apiRequest("/api/items", {
            method: "POST",
            body: JSON.stringify(item)
        });

        showMessage(result.message);
        addItemForm.reset();

        await Promise.all([
            loadAllItems(),
            loadMyItems()
        ]);
    } catch (error) {
        showMessage(error.message, true);
    }
});

searchForm.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage();

    const formData = new FormData(searchForm);

    const category = String(formData.get("category") || "")
        .trim()
        .toLowerCase();

    try {
        const result = await apiRequest(
            `/api/items/search?category=${encodeURIComponent(category)}`
        );

        renderItems(searchResults, result.items);
    } catch (error) {
        renderItems(searchResults, []);
        showMessage(error.message, true);
    }
});

async function initializePage() {
    await checkAuthentication();

    await Promise.all([
        loadAllItems(),
        loadMyItems()
    ]);
}

initializePage();