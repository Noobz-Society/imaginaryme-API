import User from "../models/User.js";
import mongoose from "mongoose";

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

const userService = {
    exists,
    getAvatars
};

export default userService;