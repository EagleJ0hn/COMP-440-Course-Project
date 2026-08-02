const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstName = document.getElementById("first").value;
    const lastName = document.getElementById("last").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;

    const user = {
        firstName: firstName,
        lastName: lastName,
        username: username,
        password: password,
        confirmPassword: confirmPassword,
        email: email,
        phone: phone
    };

    if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        const result = await response.json();

        alert(result.message);

    } catch (error) {
        console.error(error);
        alert("An error occurred while registering.");
    }
});

