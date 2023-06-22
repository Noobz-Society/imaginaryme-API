import * as svgo from "svgo";
import {parseSync, stringify} from "svgson";

/**
 * Converts an SVG string to a HAST tree
 * @param svg {string}
 */
function svgToHast(svg) {
    svg = svgo.optimize(svg).data;
    return parseSync(svg);
}

/**
 * Converts a HAST tree to an SVG string
 * @param hast {INode}
 */
function hastToSvg(hast) {
    return stringify(hast);
}

/**
 * Concatenates multiple HAST trees into a single SVG string
 * @param hasts {INode[]}
 * @param colors {string[]}
 */
function concatenateHastsToSvg(hasts, colors) {
    /**
     * Shallow copy the first HAST tree (we don't need to copy the children)
     * @type {INode}
     */
    const hast = {...hasts[0]};
    delete hast.attributes.stroke;
    delete hast.attributes.fill;
    hast.children = [];

    // Retrieve the children of each HAST tree and surround them with a group
    for (let i = 0; i < hasts.length; i++) {
        /**
         * @type {INode[]}
         */
        const children = hasts[i].children;

        // Surround the children with a group
        /**
         * @type {INode}
         */
        const group = {
            name: "g",
            type: "element",
            attributes: {
                stroke: colors[i],
                fill: colors[i]
            },
            children: children,
            value: null
        };

        hast.children.push(group);
    }
    const svg = hastToSvg(hast);
    return svgo.optimize(svg).data;
}

const svgParser = {
    svgToHast,
    hastToSvg,
    concatenateHastsToSvg
};
export default svgParser;