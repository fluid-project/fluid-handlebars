// Handlebars helper to allow us to compare values used in presentation logic.
//
// This can be used to do things like add an extra CSS class to records whose status is "deleted".
//
// The helper can be accessed in your markup using syntax like:
//
// `{{#equals VARIABLE1 VARIABLE2 }}`
// `  The variables are equal.`
// `{{/equals}}`
//
// `{{#equals VARIABLE1 "TEXT" }}`
// `  The variable is equal to the text.`
// `{{#else}}`
// `  The variable is not equal to the text.`
// `{{/equals}}
//
// Note in the second example that `else` is supported if the condition is not matched, as with the built-in `{{#if}}` helper.
//
// Adapted from the approach outlined in this blog by "bendog":
// http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/
//
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.templates.helper.equals");

gpii.templates.helper.equals.getEqualsFunction = function () {
    return function (lvalue, rvalue, options) {
        if (arguments.length < 3) {
            fluid.fail("You must call the 'equals' helper with three arguments.");
        }
        else if (lvalue !== rvalue) {
            return options.inverse(this);
        }
        else {
            return options.fn(this);
        }
    };
};

fluid.defaults("gpii.templates.helper.equals", {
    gradeNames: ["gpii.templates.helper", "autoInit"],
    helperName: "equals",
    invokers: {
        "getHelper": {
            "funcName": "gpii.templates.helper.equals.getEqualsFunction",
            "args":     ["{that}"]
        }
    }
});
