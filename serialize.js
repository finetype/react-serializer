import React from 'react';
const download = require("downloadjs");

module.exports = React.createClass({
    serialize(node, dangerouslyStringifyFunctions=false) { // always the output of React.createElement()
        // TODO:
        // might want to allow accepting array of nodes directly by "wrapping them" in a "div" and setting the direct inputs as children?
        // when doing so, does it need to handle strings? Or just nodes?
        if (typeof node.type !== 'string') {
            try {
                console.log('\n')
                console.log("trying to creating child element; this is plan B, but you should really only serialize jsx with basic DOM types, not custom types...")
                console.log('node before:', node)
                let unfrozenProps = Object.assign({}, node.props);
                delete unfrozenProps.children
                node = React.createElement(node.type, unfrozenProps, node.props.children);
                console.log('node after:', node)
            }
            catch(err) {
                throw new Error('tried to serialize a non-node. This would be non-hydratable. Aborting.');
            }
        }
        const output = [node.type];

        if (node.hasOwnProperty('props')) {
            const props = Object.assign({}, node.props); // clone props, since they're also Object.frozen

            // should serialize functions for click handlers as well...?

            let serializedChildren;
            if (props.hasOwnProperty('children')) {  // can be terminal string, array of subnodes, or single node.
                let children = props.children;

                const childIsANode = !Array.isArray(children) && typeof children === 'object';
                children = childIsANode || typeof children === 'string' ? [children] : children; // if string or node, inject into array for map call
                children = children === undefined ? [] : children;
                try {
                    serializedChildren = children.map(child => typeof child === 'string' || child === null ? child : serialize(child));
                }
                catch(err){
                    console.log("\nERROR!");
                    console.log(typeof children, children);
                    console.log(node);
                    throw new Error(err);
                }
            }

            delete props.children;
            output.push(props);

            if (serializedChildren) {
                output.push(serializedChildren);
            }
        }
        else {  // has no props
            output.push(null);  // React.createElement will expect second argument of null if there are no props.
        }

        return output; // should be the ordered arguments necessary to pass in to React.createElement to generate this node.
    },

    render() {
        const serialized = this.serialize(this.props.children); // may need to be React.createElement(this.props.children)
        download(serialized, 'serialized-component.txt', 'text/plain'); // also may need to be JSON.stringify(serialized)
        // download(functions, 'functions', 'text/plain'); 
        return (<p>I've been serialized!</p>)
    }
});
