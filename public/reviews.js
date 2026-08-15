"use strict";

// Page elements use by the review interface
const reviewForm = document.getElementById("reviewForm");
const reviewSection = document.getElementById("reviewSection");
const message = document.getElementById("message");
const authMessage = document.getElementById("authMessage");

const reviewsList = document.getElementById("reviewsList");


//Part 3: Check whether the user is logged in before they can submit a review
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

// Part 3: Load information into review selection dropdown
async function loadSelectedItem() {
    try {
        const response = await fetch("/api/items");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        const itemSelect = document.getElementById("itemId");

        // Add each item to the dropdown
        for (const item of result.items) {
            const option = document.createElement("option");

            // Keep the Item ID internally for the database request
            option.value = item.itemId;

            // Display the item name to the user
            option.textContent = item.itemTitle;

            itemSelect.appendChild(option);
        }

    } catch (error) {
        console.error("Load items error:", error);
        message.textContent = "Could not load items.";
    }
}

// Part 3: Display all the reviews
async function loadReviews() {
    try {
        const response = await fetch("/api/reviews");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        reviewsList.replaceChildren();

        // Displays message when there are no reviews
        if (result.reviews.length === 0) {
            const paragraph = document.createElement("p");
            paragraph.textContent = "No reviews have been submitted yet.";
            reviewsList.appendChild(paragraph);
            return;
        }
        // Displays each review returned by the server
        for (const review of result.reviews) {
            const article = document.createElement("article");
            article.className = "card";

            const title = document.createElement("h3");
            title.textContent = review.itemTitle;

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

// Part 3: Handle submission of a new review
reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Review form submitted")

    message.textContent = "";

    // Get information entered by the user
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

        // Send the review to the server then insert it into the reviews table
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

// Initialize review page
checkAuthentication();
loadReviews();
loadSelectedItem();
