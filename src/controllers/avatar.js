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

    const svg = svgParser.concatenateHastsToSvg(variations, ids_and_colors.map(({color}) => color));

    res.send(svg);
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
        errors.push(ApiError.InvalidType("body", "{variation: string, color: string}[]"));
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
        if (typeof color !== "string" || !validator.isHexColor(color)) {
            errors.push(ApiError.InvalidType(`body[${i}].color`, "hex color"));
        }
    }

    // If there are any errors, return them
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    ids = req.body.map(({variation}) => variation);

    const variations = await avatarService.getVariationsByIds(ids);
    const svg = svgParser.concatenateHastsToSvg(variations, req.body.map(({color}) => color));

    res.send(svg);
}


const avatarController = {
    getRandom,
    getSpecific
};

export default avatarController;