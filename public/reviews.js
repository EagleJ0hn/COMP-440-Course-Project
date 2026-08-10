"use strict";

const reviewForm = document.getElementById("reviewForm");
const reviewSection = document.getElementById("reviewSection");
const message = document.getElementById("message");
const authMessage = document.getElementById("authMessage");

const reviewsList = document.getElementById("reviewsList");
const urlParams = new URLSearchParams(window.location.search);
const selectedItemId = urlParams.get("itemId");
const itemInfo = document.getElementById("itemInfo");

async function checkAuthentication() {
    try {
        const response = await fetch("/api/me", {
            credentials: "same-origin"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        authMessage.textContent =
            `Logged in as ${result.username}`;

        return true;

    } catch (error) {
        authMessage.textContent =
            "You must be logged in to submit a review. Click Login to sign in.";

        reviewSection.classList.add("hidden");

        return false;
    }
}

async function loadSelectedItem() {
    if (!selectedItemId) {
        itemInfo.textContent = "No item selected.";
        return;
    }

    try {
        const response = await fetch("/api/items");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        const item = result.items.find(
            item => String(item.itemId) === String(selectedItemId)
        );

        if (!item) {
            itemInfo.textContent = "Item not found.";
            return;
        }

        itemInfo.textContent = `Reviewing: ${item.itemTitle}`;

    } catch (error) {
        console.error("Load item error:", error);
        itemInfo.textContent = "Could not load item information.";
    }
}

async function loadReviews() {
    try {
        const response = await fetch("/api/reviews");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        reviewsList.replaceChildren();

        if (result.reviews.length === 0) {
            const paragraph = document.createElement("p");
            paragraph.textContent = "No reviews have been submitted yet.";
            reviewsList.appendChild(paragraph);
            return;
        }

        for (const review of result.reviews) {
            const article = document.createElement("article");
            article.className = "card";

            const title = document.createElement("h3");
            title.textContent = review.itemTitle;

            const item = document.createElement("p");
            item.textContent = `Item ID: ${review.itemId}`;

            const reviewer = document.createElement("p");
            reviewer.textContent = `Reviewed by: ${review.username}`;

            const rating = document.createElement("p");
            rating.textContent = `Rating: ${review.rating}`;

            const comment = document.createElement("p");
            comment.textContent = review.comment;

            const date = document.createElement("small");
            date.textContent = `Posted: ${new Date(
                review.reviewDate
            ).toLocaleString()}`;

            article.appendChild(title);
            article.appendChild(item);
            article.appendChild(reviewer);
            article.appendChild(rating);
            article.appendChild(comment);
            article.appendChild(date);

            reviewsList.appendChild(article);
        }

    } catch (error) {
        console.error("Load reviews error:", error);

        reviewsList.replaceChildren();

        const paragraph = document.createElement("p");
        paragraph.textContent = error.message;
        reviewsList.appendChild(paragraph);
    }
}

reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Review form submitted")

    message.textContent = "";

    const itemId = Number(
        document.getElementById("itemId").value
    );

    const rating =
        document.getElementById("rating").value;

    const comment =
        document.getElementById("comment").value.trim();

    try {
        console.log("Sending review:", {
            itemId,
            rating,
            comment
        });

        const response = await fetch("/api/reviews", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "same-origin",

            body: JSON.stringify({
                itemId,
                rating,
                comment
            })
        });

        console.log("Response received:", response.status);

        const result = await response.json();

        console.log("Response data:", result);

        if (!response.ok) {
        throw new Error(result.message);
        }

        message.textContent = "Review submitted successfully.";

        reviewForm.reset();

        await loadReviews();

    } catch (error) {
        console.error("Review submission error:", error);
        message.textContent = error.message;
    }
});


checkAuthentication();
loadReviews();
loadSelectedItem();

if (selectedItemId){
    document.getElementById("itemId").value = selectedItemId;
}