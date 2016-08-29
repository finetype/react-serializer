# react-serializer

An NPM module for serialize and deserializing react components. 

Need to store component format and styling on the server? Don't store strings of 
HTML! This little library exposes React classes that you can use just 
like any other.

To use:

0. npm install react-serializer
1. create a new file that consists of *only* JSX (or React.createElement() calls) that uses *only* string classes (e.g. 'div'). At the time, the library cannot yet break down React.createClass calls fed in as types. This should essentially be everything that came after your return statement in your render function. (Note: You *can* have functions for props!)
2. Your file should look something like the example-component.js file.
3. Run: `serialize react <path to file to serialize> <output filename>`.
  (an example: `$ serialize react ./ad-card.js testoutput.js`)
4. You should have produced two files: one under the name your provided (e.g., `testoutput.js`), and one called `serialized-functions.js`.

Now let's get it back!

1. Let's go into the component you just serialized, and import the 'Deserialize' module.
2. Have the parent of this component pass in the values you copy/pasted out of testoutput.js as a prop, called "serialized" (or for now, just save it as a local variable, whatever).
3. Make sure that Deserialize imports/has access to the `serialized-functions.js` that was generated when you ran `react serialize` in step 3 above. (Only important if you have things like click handler functions.)
4. Have your render function `return (<Deserialize serialized={this.props.serialized} />)`
5. Voila!

You can install dev dependencies and run the test suite with `npm test`, which will help if you want to contribute pull requests. Please add new tests if you add new features.
