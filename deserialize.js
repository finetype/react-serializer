var React = require('react');
var serializedFunctions = require('./serialized-functions') // add link to functions here!
var deserialize = require('./core').deserialize;

module.exports = React.createClass({render: function() {
        serializedNode = typeof this.props.serialized === 'string' ? JSON.parse(this.props.serialized) : this.props.serialized;
        return this.deserialize(serializedNode, serializedFunctions, (this.props.dangerouslyEvalFunctions || false))
    }
});
