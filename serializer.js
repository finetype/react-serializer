#!/usr/bin/env node
'use strict'

var program = require('commander');
var fs = require('fs');
var serialize = require('./core').serialize;
var React = require('react');
var babel = require('babel-core')

program
  .version('0.0.1')
  .option('-p, --pretty', 'pretty print the serialized output (note: non-string output)')
  .command('react <fileToSerialize> <fileToOutputNode>'/* <fileToOutputFunctions>'*/)
  .description('turn react components into JSON strings you can pass around safely and deserialize later')
  .action(function (fileToSerialize, fileToOutputNode/*, fileToOutputFunctions, options*/) {
    console.log('\n serializing %s, saving as %s', fileToSerialize, fileToOutputNode);
    
    var transformed = babel.transformFileSync(fileToSerialize, 
      { presets: ['babel-preset-react', 'es2015'] }
    ).code;
    var toSerialize = eval(transformed);
    var serialized = serialize(toSerialize); // may need to be React.createElement(this.props.children)

    try {
      if (program.pretty) {
        fs.writeFileSync(fileToOutputNode, JSON.stringify(serialized.node, null, 2));
      }
      else {
        fs.writeFileSync(fileToOutputNode, "'" + JSON.stringify(serialized.node, null) + "'");
      }
      var functionsFilename = './zipIns.js';
      var functionsFileContents = 'module.exports = {\n';
      var count = 0;
      for (key in serialized.zipIns) {
        functionsFileContents += (count ? ',\n' : '') + '    ' + key + ': ' + String(serialized.zipIns[key]);
        count++;
      }
      functionsFileContents += '\n}\n';
      fs.writeFileSync(functionsFilename, functionsFileContents)
    }
    catch(err) {
      throw err;
    }
    console.log('\n The serialized, stringified output was saved as', fileToOutputNode);
    if (Object.keys(serialized.zipIns).length) {
      console.log('\n values were saved in zipIns.js; make sure to require those functions in the Deserialize component.\n');
    }
  });

program.parse(process.argv);
