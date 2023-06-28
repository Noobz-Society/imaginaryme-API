import express from "express";
import ApiError from "../utils/ApiError.js";
import validator from "validator";
import svgParser from "../utils/svgParser.js";
import avatarService from "../services/avatar.js";

const {Request, Response} = express;

/**
 * @param req {Request}
 * @param res {Response}
 * @returns {Promise<void>}
 */
export async function getRandom(req, res) {
    const ids_and_colors = await avatarService.getRandomVariationIdsAndColors();

    const variations = await avatarService.getVariationsByIds(ids_and_colors.map(({_id}) => _id));

    const svg = svgParser.concatenateHastsToSvg(variations.map(v => v.svg), ids_and_colors.map(({color}) => color));

    res.json({
        attributes: variations.map(v => {
            v.color = ids_and_colors.find(({_id}) => _id.equals(v._id)).color;
            delete v.svg;
            return v;
        }), svg
    });
}

/**
 * @param req {Request}
 * @param req.body {{variation: string, color: string}[]}
 * @param res {Response}
 * @returns {Promise<void>}
 */
export async function getSpecific(req, res) {
    // Initialize body if it doesn't exist, so we can check for fields, even if they are empty
    req.body ||= [];

    /**
     * The errors that will be returned to the client
     * @type {ApiError[]}
     */
    const errors = [];

    /**
     * The ids of the variations to be retrieved
     * @type {string[]}
     */
    let ids;

    if (!Array.isArray(req.body)) {
        errors.push(ApiError.InvalidType("body", "{variation: string, colorless?: boolean, color?: string}[]"));
    } else if (req.body.length === 0) {
        errors.push(ApiError.InvalidLengthArray("body", 1, -1, "If you don't want to specify any variations, use the GET method instead"));
    }

    // If there are any errors, return them
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // Check for required fields in body (loop through each color)
    for (let i = 0; i < req.body.length; i++) {
        const {variation, color} = req.body[i];
        // variation: string (hex color)
        if (typeof variation !== "string" || !validator.isMongoId(variation)) {
            errors.push(ApiError.InvalidType(`body[${i}].variation`, "ObjectId"));
        } else if (!await avatarService.variationExistsById(variation)) {
            errors.push(ApiError.NotFound(`body[${i}].variation`));
        }
        // color: string (hex color)
        if (typeof color !== "string" && color !== null || typeof color === "string" && !validator.isHexColor(color)) {
            errors.push(ApiError.InvalidType(`body[${i}].color`, "hex color or null"));
        }
    }

    // If there are any errors, return them
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    ids = req.body.map(({variation}) => variation);

    const variations = await avatarService.getVariationsByIds(ids);
    const svg = svgParser.concatenateHastsToSvg(variations.map(v => v.svg), req.body.map(({color}) => color));

    res.send(svg);
}

/**
 * @param req {Request}
 * @param res {Response}
 * @returns {Promise<void>}
 */
async function getAll(req, res) {
    const canSeePrivate = req.user?.role === "admin";

    const avatars = await avatarService.getAll(canSeePrivate);
    res.json(avatars);
}

/**
 * @param req {Request}
 * @param res {Response}
 * @returns {Promise<void>}
 */
async function get(req, res) {
    const {id} = req.params;

    if (!validator.isMongoId(id)) {
        res.json(ApiError.InvalidType("id", "ObjectId"));
        return;
    }

    const avatar = await avatarService.findOne(id);

    if (!avatar) {
        res.json(ApiError.NotFound("id"));
        return;
    }

    if (!avatar.isPublic && req.user?.role !== "admin" && avatar.user._id.toString() !== req.user.id) {
        res.json(ApiError.NotAuthorized());
        return;
    }

    res.json(avatar);
}

async function changeVisibility(req, res) {
    // Initialize body if it doesn't exist, so we can check for fields, even if they are empty
    req.body ||= {};

    /**
     * The errors that will be returned to the client
     * @type {ApiError[]}
     */
    const errors = [];

    const {id} = req.params;
    const {isPublic} = req.body;

    let avatar;
    if (!validator.isMongoId(id)) {
        errors.push(ApiError.InvalidType("id", "ObjectId"));
    } else {
        avatar = await avatarService.get(id);
        if (!avatar) {
            errors.push(ApiError.NotFound("id"));
        } else if (req.user.role !== "admin" && avatar.user.toString() !== req.user.id) {
            errors.push(ApiError.NotAuthorized());
        }
    }

    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    if (isPublic === undefined) {
        errors.push(ApiError.MissingField("isPublic"));
    } else if (typeof isPublic !== "boolean") {
        errors.push(ApiError.InvalidType("isPublic", "boolean"));
    } else if (avatar.isPublic === isPublic) {
        errors.push(ApiError.InvalidValue("isPublic", "is already set to the specified value"));
    }

    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    avatar.isPublic = isPublic;
    await avatar.save();

    res.json(avatar);
}

async function like(req, res) {
    // Initialize body if it doesn't exist, so we can check for fields, even if they are empty
    req.body ||= {};

    /**
     * The errors that will be returned to the client
     * @type {ApiError[]}
     */
    const errors = [];

    const {id} = req.params;
    const {value} = req.body;

    let avatar;
    if (!validator.isMongoId(id)) {
        errors.push(ApiError.InvalidType("id", "ObjectId"));
    } else {
        avatar = await avatarService.get(id);
        if (!avatar) {
            errors.push(ApiError.NotFound("id"));
        }
    }

    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // value: required, number, -1, 0 or 1
    if (value === undefined) {
        errors.push(ApiError.MissingField("value"));
    } else if (typeof value !== "number") {
        errors.push(ApiError.InvalidType("value", "number"));
    } else if (![1, 0, -1].includes(value)) {
        errors.push(ApiError.InvalidValue("value", "must be -1, 0 or 1"));
    }

    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // check if user has already liked or disliked this avatar
    const reviewIndex = avatar.review.findIndex(({user}) => user.equals(req.user.id));
    if (reviewIndex !== -1) {
        if (avatar.review[reviewIndex].value === value) {
            errors.push(ApiError.InvalidValue("like", "you have already liked or disliked this avatar"));
        } else if (value === 0) {
            avatar.review.splice(reviewIndex, 1);
        } else {
            avatar.review[reviewIndex].value = value;
        }
    } else {
        if (value !== 0) {
            avatar.review.push({
                user: req.user.id,
                value
            });
        }
    }

    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    await avatar.save();
    res.json(avatar);
}

async function deleteAvatar(req, res) {
    const {id} = req.params;

    const errors = [];

    if (!validator.isMongoId(id)) {
        errors.push(ApiError.InvalidType("id", "ObjectId"));
    } else {
        const avatar = await avatarService.findOne(id);
        if (!avatar) {
            errors.push(ApiError.NotFound("id"));
        } else if (req.user.role !== "admin" && avatar.user._id.toString() !== req.user.id) {
            errors.push(ApiError.NotAuthorized());
        }
    }

    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    await avatarService.deleteOne(id);
    res.status(204).send();
}


const avatarController = {
    getAll,
    get,
    getRandom,
    getSpecific,
    changeVisibility,
    like,
    deleteAvatar
};

export default avatarController;