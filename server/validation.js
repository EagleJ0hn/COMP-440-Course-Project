// Validate the information provided by the user during registration
function validateInput(input) {
    // Extract the relevant fields from the input object
    const{
        username,
        password,
        confirmPassword,
        firstName,
        lastName,
        email,
        phone
    } = input;

    // Check if any of the required fields are missing or empty
    if (!username || !password || !confirmPassword || !firstName || !lastName || !email || !phone) {
        return{
            valid: false,
            message: 'All fields are required.'
        };
    }

    //Make sure the password and confirmPassword match
    if (password !== confirmPassword) {
        return{
            valid: false,
            message: 'Passwords do not match.'
        };
    }

    return{
        valid: true,
        message: 'Input is valid.'
    };
}

// Make the functions available for import in other files
module.exports = {
    validateInput
};