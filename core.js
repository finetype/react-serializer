var React = require("react");

module.exports = {
    uniqueKey: function(key, obj, num) {
        return !obj.hasOwnProperty(key + num) ? key + num : this.uniqueKey(key, obj, num + 1);
    },

    serialize: function(node) { // always the output of React.createElement()
        var zipIns = {}; // will be populated by recurse() calls if necessary
        var entropy = 0; // used for developing unique identifying keys for zipIns

        function recurse(node) {
            if (typeof node.type !== 'string') {
                console.log("ran into problem serializing on node:\n\n", node);
                if (typeof node.type === 'function') {
                    throw new Error('Recursive serialization of custom react classes not yet implemented. Please use only DOM-strings as types (e.g., "div", "h5", etc.')
                }
                else {
                    throw new Error('cannot serialize this input. This would be non-deserializable. Aborting.');
                }
            }
            var output = [node.type];

            if (node.hasOwnProperty('props')) {
                var props = Object.assign({}, node.props || {}); // clone props, since they're also Object.frozen

                // automatically turn functions into zipIns, i.e. strings representing them in a unique structure.
                for (key in props) {
                    if (typeof props[key] === 'function') {
                        var reference = module.exports.uniqueKey(key, zipIns, entropy)
                        zipIns[reference] = props[key];
                        props[key] = { zipIn: reference };
                    }

                    // should add feature to do this recursively for methods of property objects.
                    else if (typeof props[key] === 'object' && props[key].hasOwnProperty('zipIn')) {
                        if (zipIns.hasOwnProperty(props[key]['zipIn'])) {
                            // in case the custom zipin specified overlaps with an existing zipin.
                            console.log("WARNING! Your have two zipins using the same key. You either want " +
                              "to use the same zipped-in content twice, or made a mistake. Duplicated zipin: ", props[key]['zipIn']);
                        }
                        else {
                            // in case zipin was specified manually on content being serialized
                            console.log("CAUTION: You have a prop of format: `{ zipIn: '" + props[key].zipIn + "' }`, indicating a custom zipIn. " +
                                "If you do this, there is no way at this point to guarantee no overlapping keys.");
                        }
                        zipIns[props[key].zipIn] = '"CUSTOM ZIPIN SPECIFIED. Replace this string with a value before evaluation."';
                    }
                }

                var serializedChildren;
                if (props.hasOwnProperty('children')) {  // can be terminal string, array of subnodes, or single node.
                    var children = props.children;

                    var childIsNotArray = !Array.isArray(children);
                    children = childIsNotArray ? [children] : children; // if string or node, inject into array for map call
                    children = children[0] === undefined ? [] : children;
                    serializedChildren = children.map(function(child) {
                        return typeof child.type === 'function' || typeof child.type === 'string' ? recurse(child) : child;
                    });
                    delete props.children;
                }

                if (node.ref) props.ref = node.ref;
                if (node.key) props.key = node.key;
                props = Object.keys(props).length === 0 ? null : props;
                output.push(props);

                if (serializedChildren) {
                    output.push(serializedChildren);
                }
            }
            else {
                output.push(null);  // React.createElement will expect second argument of null if there are no props.
            }
            if (output[0] === undefined) throw new Error("undefined type!")
            return output; // should be the ordered arguments necessary to pass in to React.createElement (recursively) to generate this node.
        }

        var node = recurse(node);

        return { node: node, zipIns: zipIns };
    },

    // since this will be used in production, should we instead add an optional argument for silencing and redirecting error messages to?
    deserialize: function(node, zipIns) {
        // a node is ALWAYS an array with two-to-three members: [type, props[, children]],
        if (!Array.isArray(node) ||
            (typeof node[1] !== 'object' && typeof node[1] !== 'undefined')
            ) {
            // console.log("about to fail on:", node);
            throw new Error("hit a node I can't deserialize. Lame.");
        }

        var type = node[0];
        var props = node[1]
        var children = node[2];

        // one map call to rule them all.
        children = children || []; // if undefined, make to empty array for map call
        var childIsANode = !Array.isArray(children[1]) && typeof children[1] === 'object';
        // ^an actual non-array object (or null) as the second property of an array is the signature of a node.
        children = childIsANode || typeof children === 'string' ? [children] : children; // if string or node, wrap in array for map call

        var context = this;
        children = children.map(function(descendant) { // descendants are ALWAYS actual nodes, or strings.
            var type = typeof descendant;
            return type === 'string' || type === 'number' ||
                type === 'boolean' || descendant === null ?
                descendant : context.deserialize(descendant, zipIns);
        });

        // re zip-in zipIns
        for (var key in props) {
            if (typeof props[key] === 'object' && props[key].hasOwnProperty('zipIn')){
                if (zipIns.hasOwnProperty(props[key].zipIn)){
                    props[key] = zipIns[props[key].zipIn];
                }
                else {
                    // may want to enable quiet mode so that we can have 'optional' zipins... probably safer to be noisy and force
                    // passing in blanks so that it's explicit ommission, preventing accidental silent mistakes.
                    throw new Error("can't zip in what I don't have! requested zipin " + props[key].zipIn + " was not provided.");
                }
            }
        }

        var args = [type, props].concat(children);
        return React.createElement.apply(null, args);
    }
}
