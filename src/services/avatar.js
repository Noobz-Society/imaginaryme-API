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
            variation: {
                $filter: {
                    input: "$variations",
                    cond: {
                        $in: ["$$this._id", objectIds]
                    }
                }
            },
            "z-index": 1
        }
    }, {
        $unwind: "$variation"
    }, {
        $addFields: {
            "variation.z-index": "$z-index"
        }
    }, {
        $replaceRoot: {
            newRoot: "$variation"
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
     * Filter for the aggregation pipeline
     * @type {mongoose.PipelineStage[]}
     */
    const filter = [{
        $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
        }
    }, {
        $unwind: "$user"
    }, {
        $addFields: {
            likes: {
                $size: {
                    $filter: {
                        input: "$review",
                        cond: {
                            $eq: ["$$this.value", 1]
                        }
                    }
                }
            },
            dislikes: {
                $size: {
                    $filter: {
                        input: "$review",
                        cond: {
                            $eq: ["$$this.value", -1]
                        }
                    }
                }
            }
        }
    }, {
        $project: {
            review: 0,
            "user.pwd": 0,
            "user.email": 0
        }
    }];

    if (!canSeePrivate) {
        filter.unshift({
            $match: {
                isPublic: true
            }
        });
    }

    let avatars = await Avatar.aggregate(filter);

    avatars = await Promise.all(avatars.map(async avatar => {
        const variations = await getVariationsByIds(avatar.attributes.map(({variation}) => variation));
        const colors = avatar.attributes.map(({color}) => color);

        avatar.svg = svgParser.concatenateHastsToSvg(variations.map(v => v.svg), colors);
        return avatar;
    }));

    return avatars;
}

async function exists(id) {
    return Avatar.exists({
        _id: id
    });
}

/**
 * Find one avatar by its id
 * @param id {string}
 * @returns {Promise<Avatar>}
 */
async function findOne(id) {
    /**
     * Filter for the aggregation pipeline
     * @type {mongoose.PipelineStage[]}
     */
    const filter = [{
        $match: {
            _id: new mongoose.Types.ObjectId(id)
        }
    }, {
        $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
        }
    }, {
        $unwind: "$user"
    }, {
        $addFields: {
            likes: {
                $size: {
                    $filter: {
                        input: "$review",
                        cond: {
                            $eq: ["$$this.value", 1]
                        }
                    }
                }
            },
            dislikes: {
                $size: {
                    $filter: {
                        input: "$review",
                        cond: {
                            $eq: ["$$this.value", -1]
                        }
                    }
                }
            }
        }
    }, {
        $project: {
            review: 0,
            "user.pwd": 0,
            "user.email": 0
        }
    }];

    let avatar = (await Avatar.aggregate(filter))[0];

    if (!avatar) {
        return null;
    }

    const variations = await getVariationsByIds(avatar.attributes.map(({variation}) => variation));
    const colors = avatar.attributes.map(({color}) => color);

    avatar.svg = svgParser.concatenateHastsToSvg(variations.map(v => v.svg), colors);

    return avatar;
}

async function get(id) {
    return Avatar.findById(id);
}

async function deleteOne(id) {
    return Avatar.deleteOne({
        _id: id
    });
}

const avatarService = {
    getAll,
    get,
    findOne,
    exists,
    getVariationsByIds,
    getRandomVariationIdsAndColors,
    variationExistsById,
    deleteOne
};

export default avatarService;