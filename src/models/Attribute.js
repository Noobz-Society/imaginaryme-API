import mongoose from "mongoose";

const AttributeSchema = new mongoose.Schema({
        key: {
            type: String,
            unique: true,
            required: true
        },

        variations: {
            type: [{
                name: {
                    type: String,
                    required: true
                },
                svg: {
                    type: Object,
                    required: true
                }
            }],
            default: [],
        },

        colors: {
            type: [String],
            default: []
        }
    }, {versionKey: false} // Disable the version key
);

export default mongoose.models["attributes"] || mongoose.model("attributes", AttributeSchema);