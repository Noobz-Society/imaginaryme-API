import mongoose from "mongoose";


const AvatarSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: [true, "Please provide a user!"]
        },

        name: {
            type: String,
            required: [true, "Please provide a name!"],
            minlength: [3, "Name must be at least 3 characters long, got {VALUE}"],
            maxlength: [25, "Name must be at most 25 characters long, got {VALUE}"]
        },

        isPublic: {
            type: Boolean,
            default: false
        },

        review: {
            type: [{
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "users",
                    required: true
                },
                value: {
                    type: Number,
                    required: true,
                    enum: [-1, 1]
                }
            }],
            default: []
        },

        attributes: {
            type: [{
                variation: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "attributes.variations",
                    required: true
                },
                color: {
                    type: String,
                    required: false
                }
            }],
            default: []
        },

        creationDate: {
            type: Date,
            default: Date.now
        }
    }, {versionKey: false} // Disable the version key
);

export default mongoose.models["avatars"] || mongoose.model("avatars", AvatarSchema);