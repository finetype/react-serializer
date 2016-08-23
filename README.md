# react-serializer

An NPM module for serialize and deserializing react components. 

Need to store component format and styling on the server? Don't store strings of 
HTML! This little library exposes React classes that you can use just 
like any other.

To use:

0. npm install react-serializer
1. At the top of the file of the component you want to serialize, 
import serialize from react-serializer
2. Inside of your component's render function, you probably have 
something like this:

return (<div aProp={"something"}>text!</div>)

Let's change it to:

return <Serialize><div aProp={"something"}>text!</div></Serialize>

3. Run the app in your browser, and where this component would have 
previously been rendered, it should now instead download a json 
representation of the component!

Now let's get it back!

1. Let's go into the same component we just serialized.
2. Switch the import statement around to instead import deserialize
3. For demonstration purposes, we're going to copy the contents of the 
file we downloaded and paste it into our module as the value of a 
variable. Let's call that variable "ourSerializedComponent".
4. Let's rewrite that render function again, this time to contain the 
following:

return <Deserialize serialized={ourSerializedComponent}></Deserialize>

5. Voila!
