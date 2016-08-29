var React = require("react");

module.exports = {
    uniqueKey: function(key, obj, num) {
        return !obj.hasOwnProperty(key + num) ? key + num : this.uniqueKey(key, obj, num + 1);
    },

    serialize: function(node) { // always the output of React.createElement()
        var serializedFunctions = {}; // will be populated by recurse() calls if necessary
        var entropy = 0; // used for developing unique identifying keys for functions

        function recurse(node) {
            if (typeof node.type !== 'string') {
                if (typeof node.type === 'function') {
                  console.log(node)
                  throw new Error('Recursive serialization of custom react classes not yet implemented.')
                }
                else {
                  throw new Error('cannot serialize this input. This would be non-deserializable. Aborting.');
                }
            }
            var output = [node.type];

            if (node.hasOwnProperty('props')) {
                var props = Object.assign({}, node.props || {}); // clone props, since they're also Object.frozen

                // turn functions into strings representing them in a unique structure.
                for (key in props) {
                    if (typeof props[key] === 'function') {
                        var reference = module.exports.uniqueKey(key, serializedFunctions, entropy)
                        serializedFunctions[reference] = props[key];
                        props[key] = { serializedFunction: reference };
                    }
                    // could add a safe-mode here via argument to check for props with values that are objects with keys that === serializedFunction preventatively
                }

                var serializedChildren;
                if (props.hasOwnProperty('children')) {  // can be terminal string, array of subnodes, or single node.
                    var children = props.children;

                    var childIsNotArray = !Array.isArray(children);
                    children = childIsNotArray ? [children] : children; // if string or node, inject into array for map call
                    children = children[0] === undefined ? [] : children;
                    serializedChildren = children.map(function(child) {
                      try {
                          var mapTo = recurse(child);
                      }
                      catch(err) {
                          var mapTo = child;
                      }
                      return mapTo; 
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

        return { node: node, functions: serializedFunctions };
    },

    deserialize: function(node, functions) {
        // a node is ALWAYS an array with two-to-three members: [type, props[, children]],
        if (!Array.isArray(node) /*|| typeof node[0] !== 'string'*/ ||
            (typeof node[1] !== 'object' && typeof node[1] !== 'undefined')
            ) {
            console.log("about to fail on:", node);
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

        context = this;
        children = children.map(function(descendant) { // descendants are ALWAYS actual nodes, or strings.
            var type = typeof descendant;
            return type === 'boolean' || type === 'string' || type === 'number' || descendant === null ? descendant : context.deserialize(descendant, functions);
        });

        // re zip-in functions
        for (key in props) {
            if (typeof props[key] === 'object' && props[key].hasOwnProperty('serializedFunction')){
                props[key] = functions[props[key].serializedFunction];
            }
        }

        var args = [type, props].concat(children);
        return React.createElement.apply(null, args);
    }
}
