const logoutButton = document.getElementById("logoutButton");
const loginLink = document.getElementById("loginLink");

// Checking whether to display the login or logout button
async function checkLoginStatus(){
    try{
        const response = await fetch("/api/me");
        const result = await response.json();

        if (result.success){
            // User is logged in
            loginLink.style.display = "none";
            logoutButton.style.display = "inline-block";
        }else{
            //User is logged out
            loginLink.style.display = "inline";
            logoutButton.style.display = "none";
        }
    } catch (error){
        console.error("Error checking login status:", error);

        loginLink.style.display = "inline";
        logoutButton.style.display = "none";
    }
}


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

checkLoginStatus();