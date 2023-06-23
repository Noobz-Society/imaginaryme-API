import User from "../models/User.js";
import jwtManager from "../utils/jwtManager.js";

async function emailExists(email) {
    // case insensitive
    return User.exists({email: {$regex: new RegExp(`^${email}$`, "i")}});
}

async function nameExists(name) {
    // case insensitive
    return User.exists({name: {$regex: new RegExp(`^${name}$`, "i")}});
}

async function createUser(email, name, password) {
    return User.create({
        email: email,
        name: name,
        pwd: password
    });
}

async function login(email, password) {
    const user = await User.findOne({
        email: email,
        pwd: password
    });

    if (user) {
        return jwtManager.create(user);
    }
}

const authService = {
    emailExists,
    nameExists,
    createUser,
    login
}
export default authService;