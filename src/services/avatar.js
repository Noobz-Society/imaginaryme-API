import Attribute from "../models/Attribute.js";
import mongoose from "mongoose";
import Avatar from "../models/Avatar.js";

/**
 * Get variations by their ids
 * @param ids {string[]} Array of ObjectId of the variations
 * @returns {Promise<INode[]>}
 */
async function getVariationsByIds(ids) {
    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

    let variations = await Attribute.aggregate([{
        $project: {
            variations: {
                $filter: {
                    input: "$variations",
                    cond: {
                        $in: ["$$this._id", objectIds]
                    }
                }
            }
        }
    }, {
        $unwind: "$variations"
    }, {
        $replaceRoot: {
            newRoot: "$variations"
        }
    }]);

    // noinspection JSUnresolvedReference
    return variations.map(v => v.svg);
}

async function getRandomVariationIdsAndColors() {
    return Attribute.aggregate([{
        $addFields: {
            randomVarIndex: {
                $floor: {
                    $multiply: [{$size: "$variations"}, {$rand: {}}]
                }
            },
            randomColorIndex: {
                $floor: {
                    $multiply: [{$size: "$colors"}, {$rand: {}}]
                }
            }
        }
    }, {
        $addFields: {
            randomVariation: {
                $arrayElemAt: ["$variations", "$randomVarIndex"]
            },
            randomColor: {
                $arrayElemAt: ["$colors", "$randomColorIndex"]
            }
        }
    }, {
        $project: {
            _id: "$randomVariation._id",
            color: "$randomColor"
        }
    }]);
}

async function variationExistsById(variationId) {
    return Attribute.exists({
        "variations._id": variationId
    });
}

/**
 * Get all avatars
 * @param canSeePrivate {boolean}
 * @returns {Promise<Avatar[]>}
 */
async function getAll(canSeePrivate) {
    if (canSeePrivate) {
        return Avatar.find();
    } else {
        return Avatar.find({
            private: false
        });
    }
}

const avatarService = {
    getAll,
    getVariationsByIds,
    getRandomVariationIdsAndColors,
    variationExistsById
};

export default avatarService;