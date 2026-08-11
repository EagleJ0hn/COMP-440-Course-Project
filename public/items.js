"use strict";

// Page elements
const allItemsList = document.getElementById("allItemsList");
const myItemsList = document.getElementById("myItemsList");
const searchResults = document.getElementById("searchResults");

const addItemSection = document.getElementById("add-item");
const myItemsSection = document.getElementById("my-items");

const addItemForm = document.getElementById("addItemForm");
const searchForm = document.getElementById("searchForm");

const itemCardTemplate = document.getElementById("itemCardTemplate");

let currentUsername = null;

// Format price
function formatPrice(price) {
    return `$${Number(price).toFixed(2)}`;
}


// Format date
function formatDate(date) {
    return new Date(date).toLocaleString();
}


// Display items
function renderItems(container, items) {
    container.replaceChildren();

    if (items.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No items found.";
        container.appendChild(message);
        return;
    }

    for (const item of items) {
        const card = itemCardTemplate.content.cloneNode(true);

        card.querySelector(".item-title").textContent =
            item.itemTitle;

        card.querySelector(".item-description").textContent =
            item.itemDescription || "No description";

        card.querySelector(".item-price").textContent =
            formatPrice(item.itemPrice);

        card.querySelector(".item-seller").textContent =
            item.sellerID;

        card.querySelector(".item-categories").textContent =
            item.categories || "None";

        card.querySelector(".item-date").textContent =
            `Posted ${formatDate(item.datePosted)}`;

        container.appendChild(card);
    }
}


// Send request to server
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed.");
    }

    return data;
}


// Check if user is logged in
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


// Load all items
async function loadAllItems() {
    try {
        const result = await apiRequest("/api/items");
        renderItems(allItemsList, result.items);
    } catch (error) {
        showMessage(error.message, true);
    }
}


// Load current user's items
async function loadMyItems() {
    if (!currentUsername) {
        return;
    }

    try {
        const result = await apiRequest("/api/items/mine");
        renderItems(myItemsList, result.items);
    } catch (error) {
        showMessage(error.message, true);
    }
}


// Add item
addItemForm.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage();

    if (!currentUsername) {
        showMessage("You must log in before adding an item.", true);
        return;
    }

    const formData = new FormData(addItemForm);

    const item = {
        title: formData.get("title").trim(),
        description: formData.get("description").trim(),
        price: Number(formData.get("price")),
        categories: formData.get("categories")
    };

    try {
        const result = await apiRequest("/api/items", {
            method: "POST",
            body: JSON.stringify(item)
        });

        showMessage(result.message);
        addItemForm.reset();

        loadAllItems();
        loadMyItems();
    } catch (error) {
        showMessage(error.message, true);
    }
});


// Search items
searchForm.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage();

    const formData = new FormData(searchForm);
    const category = formData.get("category").trim().toLowerCase();

    try {
        const result = await apiRequest(
            `/api/items/search?category=${encodeURIComponent(category)}`
        );

        renderItems(searchResults, result.items);
    } catch (error) {
        showMessage(error.message, true);
    }
});


// Start page
async function initializePage() {
    await checkAuthentication();
    await loadAllItems();
    await loadMyItems();
}

initializePage();