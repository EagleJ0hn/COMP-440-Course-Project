const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const loginData = {
        username: username,
        password: password
    };

    try{
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        alert(result.message);

        if (result.success){
            window.location.href = "/index.html";
        }
        
    } catch (error) {
        console.error(error);
        alert("An error occurred while logging in.");
    }
});