#!/usr/bin/env node
'use strict'

var program = require('commander');
var fs = require('fs');
var serialize = require('./core').serialize;
var React = require('react');
var babel = require('babel-core')

program
  .version('0.0.1')
  .command('react <fileToSerialize> <fileToOutputNode>' /*<fileToOutputFunctions>'*/)
  .description('turn react components into JSON strings you can pass around safely and deserialize later')
  .action(function (fileToSerialize, fileToOutputNode, fileToOutputFunctions/*, options*/) {
    console.log('\n serializing %s, saving as %s', fileToSerialize, fileToOutputNode);
    
    var transformed = babel.transformFileSync(fileToSerialize, 
      { presets: ['babel-preset-react', "es2015"] 
    }).code;
    // console.log("transformed:\n", transformed);
    var toSerialize = eval(transformed);

    var serialized = serialize(toSerialize); // may need to be React.createElement(this.props.children)
    try {
      fs.writeFileSync(fileToOutputNode, JSON.stringify(serialized.node, null, 4));
      var functionsFilename = './serialized-functions.js';
      var functionsFileContents = "module.exports = {\n";
      for (key in serialized.functions) {
        functionsFileContents += "    " + key + ": " + String(serialized.functions[key]) + "\n";
      }
      functionsFileContents += "}";
      fs.writeFileSync(functionsFilename, functionsFileContents)
    }
    catch(err) {
      throw err;
    }
    console.log("\n The serialized, stringified output was saved as", fileToOutputNode);
    if (Object.keys(serialized.functions).length) {
      console.log("\n functions were saved in serialized-functions.js; make sure to require those functions in the Deserialize component.\n");
    }
  });

program.parse(process.argv);
