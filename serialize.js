var React = require('react');
var download = require('downloadjs');
var serialize = require('./core').serialize;

module.exports = React.createClass({
render: function() {
        var serialized = serialize(React.createElement(this.props.children), (this.props.dangerouslyStringifyFunctions || false)); // may need to be React.createElement(this.props.children)
        download(JSON.stringify(serialized), 'serialized-component.txt', 'text/plain'); // also may need to be JSON.stringify(serialized)
        // download(functions, 'functions', 'text/plain'); 
        alert("File should have been downloaded. If it wasn't, check browser settings and permissions, or report an issue on github.")
        return React.createElement('p', null, "I've been serialized!");
    }
});
