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
const message = document.getElementById("message");

function clearMessage() {
    if (message) {
        message.textContent = "";
    }
}

function showMessage(text, isError = false) {
    if (message) {
        message.textContent = text;
    }

    console.log(text);
}

let currentUsername = null;


// Format price
function formatPrice(price) {
    return `$${Number(price).toFixed(2)}`;
}


// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

// Display all items
function renderAllItems(container, items) {
    container.replaceChildren();

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

// Display current user's items
function renderMyItems(container, items) {
    container.replaceChildren();

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

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.addEventListener("click", async () => {
            const newPrice = prompt(
                "Enter new price:",
                item.itemPrice
            );

            if (newPrice === null) {
                return;
            }

            const newCategories = prompt(
                "Enter categories separated by commas:",
                item.categories
            );

            if (newCategories === null) {
                return;
            }

            try {
                const result = await apiRequest(
                    `/api/items/${item.itemId}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            price: Number(newPrice),
                            categories: newCategories
                        })
                    }
                );

                alert(result.message);

                await loadAllItems();
                await loadMyItems();

            } catch (error) {
                alert(error.message);
            }
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", async () => {
            const confirmed = confirm(
                `Delete "${item.itemTitle}"?`
            );

            if (!confirmed) {
                return;
            }

            try {
                const result = await apiRequest(
                    `/api/items/${item.itemId}`,
                    {
                        method: "DELETE"
                    }
                );

                alert(result.message);

                await loadAllItems();
                await loadMyItems();

            } catch (error) {
                alert(error.message);
            }
        });

        const article = card.querySelector(".card");

        article.appendChild(editButton);
        article.appendChild(deleteButton);

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

        renderAllItems(allItemsList, result.items);

    } catch (error) {
        alert(error.message);
    }
}


// Load current user's items
async function loadMyItems() {
    if (!currentUsername) {
        return;
    }

    try {
        const result = await apiRequest("/api/items/mine");

        renderMyItems(myItemsList, result.items);

    } catch (error) {
        alert(error.message);
    }
}


// Add item
addItemForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUsername) {
        alert("You must log in before adding an item.");
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

        alert(result.message);

        addItemForm.reset();

        await loadAllItems();
        await loadMyItems();

    } catch (error) {
        alert(error.message);
    }
});


// Search items
searchForm.addEventListener("submit", async event => {
    event.preventDefault();

    const formData = new FormData(searchForm);

    const category =
        formData.get("category").trim().toLowerCase();

    try {
        const result = await apiRequest(
            `/api/items/search?category=${encodeURIComponent(category)}`
        );

        renderItems(searchResults, result.items);

    } catch (error) {
        alert(error.message);
    }
});


// Start page
async function initializePage() {
    await checkAuthentication();
    await loadAllItems();
    await loadMyItems();
}

initializePage();