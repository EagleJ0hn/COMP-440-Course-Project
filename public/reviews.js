"use strict";

const reviewForm = document.getElementById("reviewForm");
const reviewSection = document.getElementById("reviewSection");
const message = document.getElementById("message");
const authMessage = document.getElementById("authMessage");
const logoutButton = document.getElementById("logoutButton");

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
            "You must be logged in to submit a review.";

        reviewSection.classList.add("hidden");

        return false;
    }
}

reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "";

    const itemId = Number(
        document.getElementById("itemId").value
    );

    const rating =
        document.getElementById("rating").value;

    const comment =
        document.getElementById("comment").value.trim();

    try {

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

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        message.textContent =
            "Review submitted successfully.";

        reviewForm.reset();

    } catch (error) {

        message.textContent =
            error.message;
    }
});

logoutButton.addEventListener("click", async () => {

    try {

        const response = await fetch("/api/logout", {
            method: "POST",
            credentials: "same-origin"
        });

        if (response.ok) {
            window.location.href = "/index.html";
        }

    } catch (error) {
        console.error("Logout error:", error);
    }
});

checkAuthentication();