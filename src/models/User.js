import mongoose from "mongoose";
import validator from "validator";

const UserSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, "Please provide a name!"],
            unique: [true, "This name already exist"],
            minlength: [3, "Name must be at least 3 characters long, got {VALUE}"],
            maxlength: [20, "Name must be at most 20 characters long, got {VALUE}"]
        },

        email: {
            type: String,
            required: [true, "Please provide an Email!"],
            unique: [true, "This email is already used"],
            validate: [validator.isEmail, "Please provide a valid email!"]
        },

        pwd: {
            type: String,
            required: [true, "Please provide a password!"],
            unique: false
        },

        role: {
            type: String,
            required: [true, "Please provide a role!"],
            enum: ["admin", "user"],
            default: "user",
            unique: false
        },

        blocked: {
            type: Number,
            default: 0
        },

        creationDate: {
            type: Date,
            default: Date.now
        }
    }, {versionKey: false} // Disable the version key
);

export default (mongoose.models["users"] || mongoose.model("users", UserSchema));