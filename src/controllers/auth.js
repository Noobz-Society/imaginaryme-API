import express from "express";
import authService from "../services/auth.js";
import ApiError from "../utils/ApiError.js";
import validator from "validator";

import * as crypto from "crypto";

const {Request, Response} = express;

/**
 * @param req {Request}
 * @param req.body {{email: string, name: string, password: string}}
 * @param res {Response}
 * @returns {Promise<void>}
 */
async function register(req, res) {
    // Initialize body if it doesn't exist, so we can check for fields, even if they are empty
    req.body ||= {};

    /**
     * The errors that will be returned to the client
     * @type {ApiError[]}
     */
    const errors = [];
    // Check for required fields in body
    // email: required, string (email), unique, valid, ?-50 chars
    if (!req.body.email) {
        errors.push(ApiError.MissingField("email"));
    } else if (typeof req.body.email !== "string") {
        errors.push(ApiError.InvalidType("email", "string"));
    } else if (!validator.isEmail(req.body.email)) {
        errors.push(ApiError.InvalidField("email"));
    } else if (await authService.emailExists(req.body.email)) {
        errors.push(ApiError.UniqueField("email"));
    } else if (req.body.email.length > 50) {
        errors.push(ApiError.InvalidLength("email", -1, 50));
    }

    // name: required, string (ascii), unique, 3-20 chars
    if (!req.body.name) {
        errors.push(ApiError.MissingField("name"));
    } else if (typeof req.body.name !== "string") {
        errors.push(ApiError.InvalidType("name", "string"));
    } else if (req.body.name.length < 3 || req.body.name.length > 20) {
        errors.push(ApiError.InvalidLength("name", 3, 20));
    } else if (await authService.nameExists(req.body.name)) {
        errors.push(ApiError.UniqueField("name"));
    } else if (!validator.isAscii(req.body.name)) {
        errors.push(ApiError.InvalidField("name"));
    }

    // password: required, string (ascii), 8-50 chars, ?-1 uppercase, ?-1 lowercase, ?-1 number, ?-1 special char
    if (!req.body.password) {
        errors.push(ApiError.MissingField("password"));
    } else if (typeof req.body.password !== "string") {
        errors.push(ApiError.InvalidType("password", "string"));
    } else if (!validator.isAscii(req.body.password)) {
        errors.push(ApiError.InvalidField("password"));
    } else if (!validator.isStrongPassword(req.body.password)) {
        errors.push(ApiError.WeakPassword());
    }

    // If there are any errors, return them
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // If there are no errors, create the user
    const hashedPassword = crypto.SHA256(req.body.password).toString();
    const user = await authService.createUser(req.body.email, req.body.name, hashedPassword);
    user.save().then(() => {
        res.status(201).send();
    }).catch((err) => {
        res.status(500).json(err);
    });
}

/**
 * @param req {Request}
 * @param req.body {{email: string, password: string}}
 * @param res {Response}
 * @returns {Promise<void>}
 */
async function login(req, res) {
    // Initialize body if it doesn't exist, so we can check for fields, even if they are empty
    req.body ||= {};

    /**
     * The errors that will be returned to the client
     * @type {ApiError[]}
     */
    const errors = [];

    // Check for required fields in body
    // email: required, string (email), valid
    if (!req.body.email) {
        errors.push(ApiError.MissingField("email"));
    } else if (typeof req.body.email !== "string") {
        errors.push(ApiError.InvalidType("email", "string"));
    } else if (!validator.isEmail(req.body.email)) {
        errors.push(ApiError.InvalidField("email"));
    }

    // password: required, string (ascii)
    if (!req.body.password) {
        errors.push(ApiError.MissingField("password"));
    } else if (typeof req.body.password !== "string") {
        errors.push(ApiError.InvalidType("password", "string"));
    }

    // If there are any errors, return them
    if (errors.length > 0) {
        res.json(errors);
        return;
    }

    // If there are no errors, login the user
    const hashedPassword = crypto.SHA256(req.body.password).toString();
    const jwt = await authService.login(req.body.email, hashedPassword);

    if (jwt) {
        res.json(jwt);
    } else {
        res.json(ApiError.InvalidCredentials());
    }
}

function testAuth(req, res) {
    res.json("Success");
}


const authController = {
    register,
    login,
    testAuth
}
export default authController;