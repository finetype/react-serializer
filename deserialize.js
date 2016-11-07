// should actually be from the npm module eventually, only copy/pasted directly for testing purposes.
var React = require('react');
var staticZipIns = require('./zipIns.js'); // add link to functions here!
var deserialize = require('./core.js').deserialize; // needs to be better. :\

module.exports = React.createClass({
    displayName: 'deserialized-ad',
    propTypes: {
        node: React.PropTypes.string || React.PropTypes.array,
        dynamicZipIns: React.PropTypes.object
    },
    render: function() {
        var zipIns = Object.assign(this.props.dynamicZipIns, staticZipIns);
        var serializedNode = typeof this.props.node === 'string' ? JSON.parse(this.props.node) : this.props.node;
        return deserialize(serializedNode, zipIns);
    }
});
