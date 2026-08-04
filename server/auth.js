const bcrypt = require('bcrypt');
const pool = require('../db');

// Number of salt rounds for bcrypt hashing
const saltRounds = 10;


// Hash the password before storing it in the database
async function hashPassword(password) {
    return await bcrypt.hash(password, saltRounds);
}

// Verify the provided password against the hashed password
async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Register a new user in the database
async function registerUser(user) {
    //Extract the relevant fields from the user object
    const {
        username,
        password,
        firstName,
        lastName,
        email,
        phone
    } = user;

    //Check whether user already exists
    // The ? placeholder is used to prevent SQL injection
    const [existingUser] = await pool.execute(
        'SELECT username, email, phone FROM users WHERE username = ? OR email = ? OR phone = ?',
        [username, email, phone]
    );

    //Stop registration if a matching user was found
    if (existingUser.length > 0) {
        return{
            success: false,
            message: "Username, email, or phone number already exists."
        };
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    //Insert the new user into the database
    await pool.execute(
        'INSERT INTO users (username, hashedPassword, firstName, lastName, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, firstName, lastName, email, phone]
    );

    return {
        success: true,
        message: "User registered successfully."
    };
}

// Authenticate a user during login
async function loginUser(username, password) {
    // Find the user by username
    const [users] = await pool.execute(
        'SELECT username, hashedPassword, firstName, lastName, email, phone FROM users WHERE username = ?',
        [username]
    );

    // If no user was found, login fails
    if (users.length === 0) {
        return {
            success: false,
            message: "Invalid username or password."
        };
    }

    const user = users[0];

    //Compare the provided password with the stored hashed password
    const passwordMatch = await verifyPassword(
        password,
        user.hashedPassword
    );

    //If the passwords do not match, login fails
    if (!passwordMatch) {
        return {
            success: false,
            message: "Incorrect password."
        };
    }

    // Login was successful
    return {
        success: true,
        message: "Login successful.",
        user: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
        }
    };
}

// Make these functions available for import in other files
module.exports = {
    hashPassword,
    verifyPassword,
    registerUser,
    loginUser
};