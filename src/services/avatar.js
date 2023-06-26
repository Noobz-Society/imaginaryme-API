import Attribute from "../models/Attribute.js";
import mongoose from "mongoose";
import Avatar from "../models/Avatar.js";
import svgParser from "../utils/svgParser.js";

/**
 * Get variations by their ids
 * @param ids {string[]} Array of ObjectId of the variations
 * @returns {Promise<{_id: string, name: string, svg: INode}[]>}
 */
async function getVariationsByIds(ids) {
    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

    return Attribute.aggregate([{
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
    /**
     * @type {Avatar[]}
     */
    let avatars;
    if (canSeePrivate) {
        avatars = await Avatar.find();
    } else {
        avatars = await Avatar.find({
            private: false
        });
    }

    avatars = await Promise.all(avatars.map(async avatar => {
        const newAvatar = avatar.toObject();
        const variations = await getVariationsByIds(newAvatar.attributes.map(({variation}) => variation));
        const colors = newAvatar.attributes.map(({color}) => color);

        newAvatar.svg = svgParser.concatenateHastsToSvg(variations.map(v => v.svg), colors);
        return newAvatar;
    }));

    return avatars;
}

const avatarService = {
    getAll,
    getVariationsByIds,
    getRandomVariationIdsAndColors,
    variationExistsById
};

export default avatarService;