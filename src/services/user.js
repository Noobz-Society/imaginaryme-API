import User from "../models/User.js";
import mongoose from "mongoose";
import Avatar from "../models/Avatar.js";

async function exists(id) {
    return User.exists({_id: id});
}

async function getAvatars(id) {
    const user = (await User.aggregate([{
        $match: {
            _id: new mongoose.Types.ObjectId(id)
        }
    }, {
        $lookup: {
            as: "avatars",
            from: "avatars",
            foreignField: "user",
            localField: "_id"
        }
    }
    ]))[0];

    console.log(user);

    return user.avatars;
}

/**
 * Save an avatar to the database
 * @param userId
 * @param body {{name: string, attributes: {variation: string, color: string}[]}}
 */
async function saveAvatar(userId, body) {
    return Avatar.create({
        name: body.name,
        user: userId,
        attributes: body.attributes.map(v => ({
            variation: v.variation,
            color: v.color
        }))
    });
}

const userService = {
    exists,
    getAvatars,
    saveAvatar
};

export default userService;