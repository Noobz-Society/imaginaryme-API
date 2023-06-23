import express from "express";

const {Request, Response, NextFunction} = express;

/**
 * Trims all string values in the body of a POST request
 * @param req {Request}
 * @param res {Response}
 * @param next {NextFunction}
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

export default postTrimmer;