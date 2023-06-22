import Attribute from "../models/Attribute.js";
import svgParser from "../utils/svgParser.js";

async function keyExists(key) {
    return Attribute.exists({key});
}

/**
 *
 * @param key {string} Unique key of the attribute
 * @param variations {{name: string, svg: string|Object}[]}} Array of variations
 * @param colors {string[]} Array of hex colors
 */
async function create(key, variations, colors) {
    variations = variations.map(v => ({
        name: v.name,
        svg: svgParser.svgToHast(v.svg)
    }));

    return Attribute.create({
        key,
        variations,
        colors
    });
}

/**
 * Get all attributes
 */
async function getAll() {
    const attributes = await Attribute.find();
    return attributes.map(a => ({
        _id: a._id,
        key: a.key,
        variations: a.variations.map(v => ({
            _id: v._id,
            name: v.name,
            svg: svgParser.hastToSvg(v.svg)
        })),
        colors: a.colors
    }));
}

/**
 * Check if an attribute exists
 * @param id {string} ObjectId of the attribute
 */
async function exists(id) {
    return Attribute.exists({_id: id});
}

/// VARIATIONS

async function variationExists(attributeId, variationName) {
    return Attribute.exists({
        _id: attributeId,
        "variations.name": variationName
    });
}

async function addVariation(attributeId, variations) {
    variations = variations.map(v => ({
        name: v.name,
        svg: svgParser.svgToHast(v.svg)
    }));

    return Attribute.findByIdAndUpdate(attributeId, {
        $push: {
            variations: {
                $each: variations
            }
        }
    }, {new: true});
}

/// COLORS

async function addColors(attributeId, colors) {
    return Attribute.findByIdAndUpdate(attributeId, {
        $addToSet: {
            colors: {
                $each: colors
            }
        }
    }, {new: true});
}

const attributeService = {
    keyExists,
    create,
    getAll,
    exists,
    variationExists,
    addVariation,
    addColors
};

export default attributeService;