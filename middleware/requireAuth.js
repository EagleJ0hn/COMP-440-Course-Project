function requireAuth(req, res, next){
    const token = getSessionToken(req);

    if (!token || !sessionStorage.has(token)){
        return res.status(401).json({
            success: false,
            message: "You must be logged in."
        });
    }

    req.username = sessionStorage.get(token);

    next();
}

module.exports = requireAuth;
