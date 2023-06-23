import Attribute from "../models/Attribute.js";
import svgParser from "../utils/svgParser.js";

async function keyExists(key) {
    return Attribute.exists({key});
}

/**
 * Create an attribute
 * @param body {object} Attribute data
 */
async function create(body) {
    body.variations = body.variations.map(v => {
        v.svg = svgParser.hastToSvg(v.svg);
        return v;
    });

    return Attribute.create(body);
}

/**
 * Get all attributes
 */
async function getAll() {
    const attributes = await Attribute.find();
    return attributes.map(a => {
        a.variations = a.variations.map(v => {
            v.svg = svgParser.hastToSvg(v.svg);
            return v;
        });
        return a;
    });
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