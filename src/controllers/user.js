import express from "express";
import ApiError from "../utils/ApiError.js";
import userService from "../services/user.js";
import validator from "validator";
import avatarService from "../services/avatar.js";

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
        res.json(avatars);
    } catch (e) {
        res.status(500).json(e);
    }
}

/**
 * Add a new avatar to the user
 * @param req {Request}
 * @param req.body {name: string, attributes: {variation: string, color: string}[]}
 * @param res {Response}
 */
async function saveAvatar(req, res) {
    /**
     * The errors that will be returned to the client
     * @type {ApiError[]}
     */
    const errors = [];
    // Check for required fields in body
    // name: required, string, min 3, max 25
    if (!req.body.name) {
        errors.push(ApiError.MissingField("name"));
    } else if (typeof req.body.name !== "string") {
        errors.push(ApiError.InvalidType("name", "string"));
    } else if (req.body.name.length < 3 || req.body.name.length > 25) {
        errors.push(ApiError.InvalidLength("name", 3, 25));
    }

    //isPublic: boolean, default false
    if (req.body.isPublic && typeof req.body.isPublic !== "boolean") {
        errors.push(ApiError.InvalidType("isPublic", "boolean"));
    } else if (req.body.isPublic === undefined) {
        req.body.isPublic = false;
    }

    // attributes: required, {variation: string, color: string}[], min 1
    if (!req.body.attributes) {
        errors.push(ApiError.MissingField("attributes"));
    } else if (!Array.isArray(req.body.attributes)) {
        errors.push(ApiError.InvalidType("attributes", "array"));
    } else if (req.body.attributes.length < 1) {
        errors.push(ApiError.InvalidLengthArray("attributes", 1, -1));
    } else {
        // Check for required fields in body (loop through each color)
        for (let i = 0; i < req.body.attributes.length; i++) {
            const {variation, color} = req.body.attributes[i];
            // variation: string (hex color)
            if (typeof variation !== "string" || !validator.isMongoId(variation)) {
                errors.push(ApiError.InvalidType(`attributes[${i}].variation`, "ObjectId"));
            } else if (!await avatarService.variationExistsById(variation)) {
                errors.push(ApiError.NotFound(`attributes[${i}].variation`));
            }
            // color: string (hex color) or null
            if (typeof color !== "string" && color !== null) {
                errors.push(ApiError.InvalidType(`attributes[${i}].color`, "hex color or null"));
            } else if (color !== null && !validator.isHexColor(color)) {
                errors.push(ApiError.InvalidType(`attributes[${i}].color`, "hex color or null"));
            }
        }
    }

    // If there are any errors, return them to the client
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // Save the avatars
    try {
        const avatar = await userService.saveAvatar(req.user.id, req.body);
        await avatar.save();
        res.status(201).json(avatar);
    } catch (e) {
        res.status(500).json(e);
    }
}

const userController = {
    getAvatars,
    saveAvatar
};

export default userController;