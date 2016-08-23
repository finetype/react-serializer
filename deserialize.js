import React from 'react';
import splitFunctions from 'split-functions'

module.exports = React.createClass({
    deserialize(node, dangerouslyEvalFunctions=false) {
        // a node is ALWAYS an array with two or three members: [type, props[, children]],
        if (!Array.isArray(node) /*|| typeof node[0] !== 'string'*/ || typeof node[1] !== 'object') {
            console.log("about to fail on:", node);
            throw new Error("hit a node I can't deserialize. Lame.");
        }

        let children = node[2];
        const [type, props] = node;

        // one map call to rule them all.
        children = children || []; // if undefined, make to empty array for map call
        const childIsANode = !Array.isArray(children[1]) && typeof children[1] === 'object';
        // ^an actual non-array object (or null) as the second property of an array is the signature of a node.
        children = childIsANode || typeof children === 'string' ? [children] : children; // if string or node, wrap in array for map call

        children = children.map(descendant => { // descendants are ALWAYS actual nodes, or strings.
            return typeof descendant === 'string' || descendant === null ? descendant : deserialize(descendant);
        });
        return React.createElement(type, props, ...children);
    },

    render() {
        return this.deserialize(this.props.serialized)
    }
});
