function validateInput(input) {
    const{
        username,
        password,
        confirmPassword,
        firstName,
        lastName,
        email,
        phone
    } = input;

    if (!username || !password || !confirmPassword || !firstName || !lastName || !email || !phone) {
        return{
            valid: false,
            message: 'All fields are required.'
        };
    }

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

module.exports = {
    validateInput
};