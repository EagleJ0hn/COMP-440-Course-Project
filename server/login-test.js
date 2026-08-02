const { loginUser } = require("./auth");

async function testLogin() {
    console.log("Test 1: Correct login");

    const result = await loginUser(
        "testuser123",
        "TestPassword123!"
    );

    console.log(result);

    console.log("\nTest 2: Incorrect password");

    const failedResult = await loginUser(
        "testuser123",
        "WrongPassword123!"
    );

    console.log(failedResult);

    console.log("\nTest 3: Non-existent username");

    const missingUser = await loginUser(
        "doesnotexist",
        "TestPassword123!"
    );

    console.log(missingUser);
}

testLogin();