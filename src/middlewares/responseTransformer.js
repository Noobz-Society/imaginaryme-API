// noinspection JSUnusedLocalSymbols
const express = require("express");
const ApiError = require("../utils/ApiError");

/**
 * @param req {express.Request}
 * @param res {express.Response}
 * @param next {express.NextFunction}
 * @returns {Promise<void>}
 */
function responseTransformer(req, res, next) {
    const initialJson = res.json;

    /**
     *
     * @param data {any | ApiError[]}
     */
    res.json = function (data) {
        if (Array.isArray(data) && data.every((item) => item instanceof ApiError)) {
            this.statusCode = chooseBestStatusCode(data.map(e => e.statusCode));

            const result = {};
            for (const error of data) {
                result[error.field] = {
                    message: error.message,
                    error: error.error
                };
            }

            data = result;
        } else if (data instanceof ApiError) {
            this.statusCode = data.statusCode;

            data = {
                message: data.message,
                error: data.error
            };
        }

        initialJson.call(this, data);
    };

    next();
}

function chooseBestStatusCode(errors) {
    // From most important to the least important
    const importanceOrderedErrors = [500, 401, 403, 404, 400, 409];

    for (const error of importanceOrderedErrors) {
        if (errors.some(e => e === error)) {
            return error;
        }
    }

    return 418;
}

module.exports = responseTransformer;