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

    return user.avatars;
}

/**
 * Save an avatar to the database
 * @param userId
 * @param body {{name: string, isPublic: boolean, attributes: {variation: string, color: string}[]}}
 */
async function saveAvatar(userId, body) {
    return Avatar.create({
        name: body.name,
        isPublic: body.isPublic,
        user: userId,
        attributes: body.attributes.map(v => ({
            variation: v.variation,
            color: v.color
        }))
    });
}

async function findOne(id) {
    return User.findOne({
        _id: id
    });
}

async function deleteOne(id) {
    return User.deleteOne({
        _id: id
    });
}

const userService = {
    exists,
    findOne,
    getAvatars,
    saveAvatar,
    deleteOne
};

export default userService;