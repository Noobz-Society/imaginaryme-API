import express from "express";
import ApiError from "../utils/ApiError.js";

const {Request, Response, NextFunction} = express;


/**
 * @param req {Request}
 * @param res {Response}
 * @param next {NextFunction}
 * @returns {Promise<void>}
 */
function responseTransformer(req, res, next) {
    const initialJson = res.json;

    /**
     *
     * @param data {any | ApiError[]}
     */
    res.json = function (data) {
        if (data instanceof ApiError) {
            data = [data];
        }

        if (Array.isArray(data) && data.every((item) => item instanceof ApiError)) {
            this.statusCode = chooseBestStatusCode(data.map(e => e.statusCode));

            const result = [];
            for (const error of data) {
                result.push({
                    message: error.message,
                    error: error.error,
                    field: error.field
                })
            }

            data = result;
        }

        initialJson.call(this, data);
    };

    next();
}

function chooseBestStatusCode(errors) {
    // From most important to the least important
    const importanceOrderedErrors = [500, 401, 403, 400, 404, 409];

    for (const error of importanceOrderedErrors) {
        if (errors.some(e => e === error)) {
            return error;
        }
    }

    return 418;
}

export default responseTransformer;