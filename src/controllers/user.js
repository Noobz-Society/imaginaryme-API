import express from "express";
import ApiError from "../utils/ApiError.js";
import userService from "../services/user.js";
import validator from "validator";

const {Request, Response} = express;

/**
 * @param req {Request}
 * @param req.params {{userId: string}}
 * @param res {Response}
 * @returns {Promise<void>}
 */
async function getAvatars(req, res) {
    /**
     * The errors that will be returned to the client
     * @type {ApiError[]}
     */
    const errors = [];
    // Check for required fields in params
    // id: required, mongodb id, exists
    if (!req.params.userId) {
        errors.push(ApiError.MissingField("id"));
    } else if (!validator.isMongoId(req.params.userId)) {
        errors.push(ApiError.InvalidType("id", "ObjectId"));
    } else if (!await userService.exists(req.params.userId)) {
        errors.push(ApiError.NotFound("id"));
    }

    // If there are any errors, return them to the client
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // Get the user's avatars
    try {
        const avatars = await userService.getAvatars(req.params.userId);
        console.log(avatars);
        res.json(avatars);
    } catch (e) {
        res.status(500).json(e);
    }
}

const userController = {
    getAvatars
};

export default userController;