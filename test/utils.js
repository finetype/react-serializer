var React = require('react');

module.exports = {
    nestedReactElementWithBasicDOMTypesNoFunctions: React.createElement(
        "a",
        { className: "testClassName", target: 'aTarget', onClick: 'clickHandler', href: 'getHref' },
        React.createElement(
            "div",
            { className: "inner" },
            'textBanner',
            React.createElement(
                "div",
                { className: "cell name-wrap" },
                React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "span",
                        { ref: "spanref", className: "carrier-name" },
                        'textCarrierTitle'
                    ),
                    'textTag'
                )
            ),
            React.createElement(
                "div",
                { className: 'aClassNameTest1' },
                React.createElement(
                    "div",
                    { key: "divkey", className: "inner" },
                    '$',
                    React.createElement(
                        "span",
                        { className: "rate" },
                        'rateValue text'
                    ),
                    React.createElement("span", null)
                )
            ),
            React.createElement(
                "div",
                { className: 'wrapClasses' },
                React.createElement(
                    "div",
                    { className: "inner" },
                    React.createElement(
                        "button",
                        { className: 'classes, yo' },
                        'button',
                        'caret'
                    )
                )
            )
        )
    ),
    nestedReactElementWithBasicDOMTypesWithFunctions: React.createElement(
        "a",
        { className: "testClassName", target: 'aTarget', onClick: function() {'click handler'}, href: 'getHref' },
        React.createElement(
            "div",
            { className: "inner" },
            'textBanner',
            React.createElement(
                "div",
                { className: "cell name-wrap" },
                React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "span",
                        { ref: "spanref", className: "carrier-name" },
                        4
                    ),
                    true
                )
            ),
            React.createElement(
                "div",
                { className: 'aClassNameTest1' },
                React.createElement(
                    "div",
                    { onClick: function() {}, key: "divkey", className: "inner" },
                    '$',
                    React.createElement(
                        "span",
                        { className: "rate", funkyProp: function() { 'yo'} },
                        'rateValue text'
                    ),
                    React.createElement("span", null)
                )
            ),
            React.createElement(
                "div",
                { className: 'wrapClasses' },
                React.createElement(
                    "div",
                    { className: "inner" },
                    React.createElement(
                        "button",
                        { className: 'classes, yo' },
                        'button',
                        'caret'
                    )
                )
            )
        )
    ),
    sampleCustomClass: React.createFactory(React.createClass({
        capitalize: function(arg) { return arg.toUpperCase() },
        render: function() {
            var args = ['p', null, 'ch-ch-ch-child', capitalize(this.props.content)]/*.concat(this.props.children)*/;
            console.log("$$$$$$$$$$calling createElement from within custom class with:", args)
            return React.createElement.apply(null, args);
        }
    })),
    nestedReactElementWithCustomClassTypes: React.createElement(
        'div',
        null,
        React.createElement(
            this.sampleCustomClass,
            {content: "test"}/*,
            React.createElement("p", null, "testing!"),
            React.createElement("div", null, null)*/
        )
    ),
    nonNestedReactElementWithCustomClassTypes: React.createElement(
            React.createFactory(this.sampleCustomClass),
            {content: "test"},
            React.createElement("p", null, "testing!"),
            React.createElement("div", null, null)
    ),
    stringifiedSerializedNestedComponent: JSON.stringify(this.serializedNestedComponent),
    serializedNestedComponent: [ 'a',
                                  { className: 'testClassName',
                                    target: 'aTarget',
                                    onClick: 'clickHandler',
                                    href: 'getHref'
                                  },
                                  [ 
                                    [ 'div', 
                                      { prop: 'aProp' },
                                      [
                                        ['a']
                                      ] 
                                    ]
                                  ]
                               ],
    deepEqualSO: function(x, y) {
        // from a stack overflow answer

        if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
        // after this just checking type of one would be enough
        if (x.constructor !== y.constructor) { return false; }
        // if they are functions, they should exactly refer to same one (because of closures)
        if (x instanceof Function) { return x === y || String(x) === String(y); }
        // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
        if (x instanceof RegExp) { return x === y; }
        if (x === y || x.valueOf() === y.valueOf()) { return true; }
        if (Array.isArray(x) && x.length !== y.length) { return false; }

        // if they are dates, they must had equal valueOf
        if (x instanceof Date) { return false; }

        // if they are strictly equal, they both need to be object at least
        if (!(x instanceof Object)) { return false; }
        if (!(y instanceof Object)) { return false; }

        // recursive object equality check
        var p = Object.keys(x);
        return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) && p.every(function (i) { return this.deepEqualSO(x[i], y[i]); }, this);
    }
};
