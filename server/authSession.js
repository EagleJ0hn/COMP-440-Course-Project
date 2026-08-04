const crypto = require("crypto");

const sessions = new Map();

function createSession(username){
    const token = crypto.randomBytes(32).toString("hex");

    sessions.set(token, username);

    return token;
}

function getSessionToken(req){
    const cookieHeader = req.headers.cookie;

    if(!cookieHeader){
        return null;
    }

    const cookies = cookieHeader.split(";");

    for (const cookie of cookies){
        const [name, value] = cookie.trim().split("=");

        if (name === "sessionToken"){
            return value;
        }
    }

    return null;
}

function requireAuth(req, res, next){
    const token = getSessionToken(req);

    if (!token || !sessions.has(token)){
        return res.status(401).json({
            success: false,
            message: "You must be logged in."
        });
    }

    req.username = sessions.get(token);

    next();
}

module.exports = {
    createSession,
    requireAuth
};