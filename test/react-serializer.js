var React = require('react');
var Serialize = require('../serialize');
var Deserialize = require('../deserialize');
var core = require('../core');
var utils = require('./utils');
var deepEqualSO = require('./utils').deepEqualSO;
var deepEqual = require("assert").deepEqual;
var deepStrictEqual = require("assert").deepStrictEqual;

var expect = require('chai').expect;
var should = require('chai').should();
// var assert = require('chai').assert;

describe('core.serialize', function() {
  it('serializes string children correctly', function() {
    var originalElement = React.createElement("p", null, "hi!");
    var serializedElement = core.serialize(originalElement, false).node;
    expect(serializedElement[0]).to.equal("p");
    expect(serializedElement[1]).to.equal(null);
    expect(serializedElement[2][0]).to.equal("hi!");
  });
  it('serializes `ref` and `key` correctly when present', function() {
    var originalElement = React.createElement("p", {ref: "myRef", key: "myKey"}, "hi!");
    var serializedElement = core.serialize(originalElement, false).node;
    expect(serializedElement[1].key).to.equal("myKey")
    expect(serializedElement[1].ref).to.equal("myRef")
  });
  it('does not serializes `ref` or `key` null values into strings when not set', function() {
    var originalElement = React.createElement("p", {ref: null, other: 'test'}, "hi!");
    var serializedElement = core.serialize(originalElement, false).node;
    expect(serializedElement[1].ref).to.not.exist
    expect(serializedElement[1].other).to.exist
  });
  it('serializes nodes recursively', function() {
    var innerLayerNode = React.createElement("p", null, "hi!");
    var midLayerNode = React.createElement('div', null, innerLayerNode);
    var outerLayerNode = React.createElement('span', null, midLayerNode);
    var serializedElement = core.serialize(outerLayerNode).node;
    expect(serializedElement[0]).to.equal("span")
    expect(serializedElement[2][0][0]).to.equal("div")
    expect(serializedElement[2][0][2][0][0]).to.equal("p")
  });
  it('serializes props correctly', function() {
    var innerLayerNode = React.createElement("p", {a: "a"}, "hi!", 4, true);
    var midLayerNode = React.createElement('div', null, innerLayerNode);
    var outerLayerNode = React.createElement('span', {c: "c"}, midLayerNode);
    var serializedElement = core.serialize(outerLayerNode).node;
    expect(serializedElement[0]).to.equal("span")
    expect(serializedElement[1].c).to.equal("c")
    expect(serializedElement[2][0][1]).to.equal(null)
    expect(serializedElement[2][0][2][0][1].a).to.equal("a")
  });
  it('produces JSON output', function() {
    var serializedElement = core.serialize(utils.nestedReactElementWithBasicDOMTypesNoFunctions).node;
    var stringifiedSerializedElement = JSON.stringify(serializedElement);
    var parsedStringiedSerializedElement = JSON.parse(stringifiedSerializedElement);
    expect(utils.deepEqualSO(parsedStringiedSerializedElement, serializedElement)).to.be.true
  });
  it('replaces functions with strings that it also passes, and does not get tripped up on duplicate keynames', function() {
    var originalOuterOnClickFunction = String(utils.nestedReactElementWithBasicDOMTypesWithFunctions.props.onClick);
    var serialized = core.serialize(utils.nestedReactElementWithBasicDOMTypesWithFunctions);
    var serializedElement = serialized.node;
    var zipIns = serialized.zipIns;
    expect(typeof serializedElement[1].onClick.zipIn).to.equal('string')
    expect(typeof eval("(" + zipIns[serializedElement[1].onClick.zipIn] + ")")).to.equal('function')
    expect(String(zipIns[serializedElement[1].onClick.zipIn])).to.equal(originalOuterOnClickFunction)
    expect(Object.keys(zipIns).length).to.equal(3)
  });

  // add tests around caution outputs for predefined zipins, duplicated zipin keys, etc.

  // does not work yet
  // it('serializes nodes with custom ReactClass functions as types', function() {
  //   var nodeWithCustomClass = React.createElement(utils.sampleCustomClass, { content: "stuff" }, "child")
  //   serializedElement = core.serialize(nodeWithCustomClass);
  //   (serializedElement[0]).to.equal("span")
  // });
});

describe('core.deserialize', function() {
  // coverage for deserializing is not ideal, but acceptable because it is covered by integration test
  it('turns serialized input into React virtualDOM elements', function() {
    var deserialized = core.deserialize(utils.serializedNestedComponent);
    expect(React.isValidElement(deserialized)).to.equal(true);
    // ideally add better coverage here.
  });
  it('replaces serialized function string names with corresponding functions', function() {
    var node = ['p', { propertyName: { zipIn: 'propertyName0'} }];
    var zipIns = { propertyName0: function (){ "dosomething" } };
    var deserializedNode = core.deserialize(node, zipIns, false)
    console.log(typeof deserializedNode.props.propertyName);
    console.log(String(deserializedNode.props.propertyName))
    expect(typeof deserializedNode.props.propertyName).to.equal('function')
    expect(String(deserializedNode.props.propertyName)).to.equal(String(zipIns.propertyName0))
    // ideally add nestedness to this test.
  });

  // add coverage for throwing errors on non-provided zipin.
});

describe('core.serialize -> core.deserialize, integrated', function() {
  it('produces the same output as was fed as input (DOM types only, no function props)', function() {
    var preSerialization = utils.nestedReactElementWithBasicDOMTypesNoFunctions;
    var postSerialization = core.serialize(preSerialization, false).node;
    var postDeserialization = core.deserialize(postSerialization);
    expect(utils.deepEqualSO(postDeserialization, preSerialization)).to.equal(true) // try deepStrictEqual
  });
  it('produces the same output as was fed as input (DOM types only, with function props)', function() {
    var preSerialization = utils.nestedReactElementWithBasicDOMTypesWithFunctions
    var postSerialization = core.serialize(preSerialization);
    var postDeserialization = core.deserialize(postSerialization.node, postSerialization.zipIns);
    expect(utils.deepEqualSO(postDeserialization, preSerialization)).to.equal(true) // try deepStrictEqual
  });
  
  // does not yet work; maybe the skin-deep package's methedology could help, or using shallowRenderers recursively?
  // it('produces the same output as was fed as input (with custom React class types, no function props)', function() {
  //   var preSerialization = utils.nestedReactElementWithCustomClassTypes; React.createElement('p', null, React.createElement('p', {test: 'test'}, 'content'));
  //   var postSerialization = core.serialize(preSerialization, false);
  //   var postDeserialization = core.deserialize(postSerialization);
  //   deepEqual(postDeserialization, preSerialization) // try deepStrictEqual
  // });
})

// describe('serializer command', function() {

// });

describe('Deserialize React Class', function() {
  // coverage could be better here
  it('renders the deserialized component', function() {
    var deserializedComponent = React.createElement(Deserialize, {serialized: utils.serializedNestedComponent});
    expect(React.isValidElement(deserializedComponent)).to.equal(true);
  });
  it('also accepts JSON', function() {
    var deserializedComponent = React.createElement(Deserialize, {serialized: utils.stringifiedSerializedComponent});
    expect(React.isValidElement(deserializedComponent)).to.equal(true);
  });
});
