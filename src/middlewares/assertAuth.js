import jwtManager from "../utils/jwtManager.js";
import ApiError from "../utils/ApiError.js";

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
        if (req.user.role !== "admin") {
            res.json(ApiError.NotAuthorized());
            return;
        }

        next();
    })
}

export {requireAuth, requireAdmin}

