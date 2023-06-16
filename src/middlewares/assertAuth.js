const jwtManager = require("../utils/jwtManager");
const ApiError = require("../utils/ApiError");

function requireAuth(req, res, next) {
    try {
        // get the token from the authorization header
        const token = req.headers.authorization.split(" ")[1];
        req.user = jwtManager.verify(token)

        next();
    } catch (error) {
        res.json(ApiError.NotAuthenticated());
    }
}

function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        console.log(req.user)
        if (req.user.role !== "admin") {
            res.json(ApiError.NotAuthorized());
            return;
        }

        next();
    })
}

module.exports = {
    requireAuth,
    requireAdmin
}
