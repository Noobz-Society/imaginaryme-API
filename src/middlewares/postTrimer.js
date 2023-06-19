// noinspection JSUnusedLocalSymbols
const express = require("express");

/**
 * Trims all string values in the body of a POST request
 * @param req {express.Request}
 * @param res {express.Response}
 * @param next {express.NextFunction}
 * @returns {Promise<void>}
 */
function postTrimmer(req, res, next) {
    if (req.method === "POST") {
        for (const [key, value] of Object.entries(req.body)) {
            if (typeof value === "string")
                req.body[key] = value.trim();
        }
    }
    next();
}

module.exports = postTrimmer;