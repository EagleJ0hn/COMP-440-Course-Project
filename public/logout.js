const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/logout", {
                method: "POST"
            });

            const result = await response.json();

            alert(result.message);

            if (result.success) {
                window.location.href = "/login.html";
            }

        } catch (error) {
            console.error(error);
            alert("An error occurred while logging out.");
        }
    });
}