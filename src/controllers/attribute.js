import express from "express";
import ApiError from "../utils/ApiError.js";
import attributeService from "../services/attribute.js";
import isSvg from "is-svg";
import validator from "validator";

const {Request, Response} = express;

/**
 * @param req {Request}
 * @param req.body {{key: string, variations: {name: string, svg: string}[]}}
 * @param res {Response}
 * @returns {Promise<void>}
 */
async function create(req, res) {
    // Initialize body if it doesn't exist, so we can check for fields, even if they are empty
    req.body ||= {};

    /**
     * The errors that will be returned to the client
     * @type {ApiError[]}
     */
    const errors = [];
    // Check for required fields in body
    // key: required, string, unique, 3-20 chars
    if (!req.body.key) {
        errors.push(ApiError.MissingField("key"));
    } else if (typeof req.body.key !== "string") {
        errors.push(ApiError.InvalidType("key", "string"));
    } else if (req.body.key.length < 3 || req.body.key.length > 20) {
        errors.push(ApiError.InvalidLength("key", 3, 20));
    } else if (await attributeService.keyExists(req.body.key)) {
        errors.push(ApiError.UniqueField("key"));
    }

    // variations: required, {name: string, svg: svg}[], min 1
    if (!req.body.variations) {
        errors.push(ApiError.MissingField("variations"));
    } else if (!Array.isArray(req.body.variations) || !req.body.variations.every(v => typeof v === "object" && typeof v.name === "string" && isSvg(v.svg))) {
        errors.push(ApiError.InvalidType("variations", "{name: string, svg: string}[]"));
    } else if (req.body.variations.length < 1) {
        errors.push(ApiError.InvalidLengthArray("variations", 1, -1));
    }

    // colors: required, array<string (hex)>, min 1
    if (!req.body.colors) {
        errors.push(ApiError.MissingField("colors"));
    } else if (!Array.isArray(req.body.colors) || !req.body.colors.every(c => typeof c === "string" && validator.isHexColor(c))) {
        errors.push(ApiError.InvalidType("colors", "hex color[]"));
    } else if (req.body.colors.length < 1) {
        errors.push(ApiError.InvalidLengthArray("colors", 1, -1));
    }

    // If there are any errors, return them
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // Create the attribute
    const attribute = await attributeService.create(req.body.key, req.body.variations, req.body.colors);
    attribute.save().then(() => {
        res.status(201).json(attribute);
    }).catch((err) => {
        res.status(500).json(err);
    });
}

/**
 * @param req {Request}
 * @param res {Response}
 * @returns {Promise<void>}
 */
async function getAll(req, res) {
    const attributes = await attributeService.getAll();
    res.json(attributes);
}

/**
 * @param req {Request}
 * @param req.params {{id: string}}
 * @param req.body {{name: string, svg: string}[] }
 * @param res {Response}
 * @returns {Promise<void>}
 */
async function addVariations(req, res) {
    /**
     * The errors that will be returned to the client
     * @type {ApiError[]}
     */
    const errors = [];
    // Check for required fields in params
    // id: required, mongodb id, exists
    if (!req.params.id) {
        errors.push(ApiError.MissingField("id"));
    } else if (!validator.isMongoId(req.params.id)) {
        errors.push(ApiError.InvalidType("id", "ObjectId"));
    } else if (!await attributeService.exists(req.params.id)) {
        errors.push(ApiError.NotFound("id"));
    }

    // If there are any errors, return them
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // Initialize body if it doesn't exist, so we can check for fields, even if they are empty
    req.body ||= [];

    // Check for required type of body
    if (!Array.isArray(req.body)) {
        errors.push(ApiError.InvalidType("body", "{name: string, svg: string}[]"));
    } else if (req.body.length < 1) {
        errors.push(ApiError.InvalidLengthArray("body", 1, -1));
    }

    // If there are any errors, return them
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // Check for required fields in body (loop through each variation)
    for (let i = 0; i < req.body.length; i++) {
        const variation = req.body[i];
        // name: required, string, unique, 3-20 chars
        if (!variation.name) {
            errors.push(ApiError.MissingField(`body[${i}].name`));
        } else if (typeof variation.name !== "string") {
            errors.push(ApiError.InvalidType(`body[${i}].name`, "string"));
        } else if (variation.name.length < 3 || variation.name.length > 20) {
            errors.push(ApiError.InvalidLength(`body[${i}].name`, 3, 20));
        } else if (await attributeService.variationExists(req.params.id, variation.name)) {
            errors.push(ApiError.UniqueField(`body[${i}].name`));
        }

        // svg: required, svg
        if (!variation.svg) {
            errors.push(ApiError.MissingField(`body[${i}].svg`));
        } else if (!isSvg(variation.svg)) {
            errors.push(ApiError.InvalidType(`body[${i}].svg`, "svg"));
        }
    }

    // If there are any errors, return them
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // Add the variations
    try {
        const updatedAttribute = await attributeService.addVariation(req.params.id, req.body);
        res.status(201).json(updatedAttribute);
    } catch (err) {
        res.status(500).json(err);
    }
}

/**
 * @param req {Request}
 * @param req.params {{id: string}}
 * @param req.body {string[]}
 * @param res {Response}
 * @returns {Promise<void>}
 */
async function addColors(req, res) {
    /**
     * The errors that will be returned to the client
     * @type {ApiError[]}
     */
    const errors = [];
    // Check for required fields in params
    // id: required, mongodb id, exists
    if (!req.params.id) {
        errors.push(ApiError.MissingField("id"));
    } else if (!validator.isMongoId(req.params.id)) {
        errors.push(ApiError.InvalidType("id", "ObjectId"));
    } else if (!await attributeService.exists(req.params.id)) {
        errors.push(ApiError.NotFound("id"));
    }

    // If there are any errors, return them
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // Initialize body if it doesn't exist, so we can check for fields, even if they are empty
    req.body ||= [];

    // Check for required type of body
    if (!Array.isArray(req.body)) {
        errors.push(ApiError.InvalidType("body", "string[]"));
    } else if (req.body.length < 1) {
        errors.push(ApiError.InvalidLengthArray("body", 1, -1));
    }

    // If there are any errors, return them
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // Check for required fields in body (loop through each color)
    for (let i = 0; i < req.body.length; i++) {
        const color = req.body[i];
        // color: string (hex color)
        if (typeof color !== "string" || !validator.isHexColor(color)) {
            errors.push(ApiError.InvalidType(`body[${i}]`, "hex color"));
        }
    }

    // If there are any errors, return them
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // Add the colors
    try {
        const updatedAttribute = await attributeService.addColors(req.params.id, req.body);
        res.status(201).json(updatedAttribute);
    } catch (err) {
        res.status(500).json(err);
    }
}

const attributeController = {
    create,
    getAll,
    addVariations,
    addColors
};

export default attributeController;