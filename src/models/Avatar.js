/**
 *
 * @type {Mongoose}
 */
const mongoose = require("mongoose");

/**
 * @type {Schema}
 */
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
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "users",
                    required: true
                }
            }],
            default: []
        },

        attributes: {
            type: [{
                key: {
                    type: String,
                    required: true
                },
                variationName: {
                    type: String,
                    required: true
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

module.exports = mongoose.model("avatars", AvatarSchema);