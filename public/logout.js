const logoutButton = document.getElementById("logoutButton");
const loginLink = document.getElementById("loginLink");

// Checking whether to display the login or logout button
async function checkLoginStatus(){
    try{
        const response = await fetch("/api/me");
        const result = await response.json();

        if (result.success){
            // User is logged in
            if (loginLink) {
                loginLink.style.display = "none";
            }

            if (logoutButton) {
                logoutButton.style.display = "inline-block";
            }
        }else{
            //User is logged out
            if (loginLink) {
                loginLink.style.display = "inline";
            }

            if (logoutButton) {
                logoutButton.style.display = "none";
            }
        }
    } catch (error){
        console.error("Error checking login status:", error);

        if (loginLink) {
            loginLink.style.display = "inline";
        }

        if (logoutButton) {
            logoutButton.style.display = "none";
        }
    }
}

// Logout
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/logout", {
                method: "POST"
            });

            const result = await response.json();
            
            if (result.success) {
                window.location.href = "/index.html";
            } else {
                alert(result.message);
            }

        } catch (error) {
            console.error(error);
            alert("An error occurred while logging out.");
        }
    });
}

checkLoginStatus();