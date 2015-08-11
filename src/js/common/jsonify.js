// Handlebars helper to allow us to output JSON structures as part of rendered content.
//
// This can be accessed in your markup using syntax like:
//
// `{{{jsonify VARIABLE}}}`
//
// The triple braces are advisable to avoid escaping ampersands.
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.templates.helper.jsonify");

gpii.templates.helper.jsonify.getJsonifyFunction = function () {
    return function (context) {
        try {
            return JSON.stringify(context, null, 2);
        }
        catch (e) {
            fluid.fail("Can't convert JSON object to string: " + e);
            return context;
        }
    };
};

fluid.defaults("gpii.templates.helper.jsonify", {
    gradeNames: ["gpii.templates.helper", "autoInit"],
    helperName: "jsonify",
    invokers: {
        "getHelper": {
            "funcName": "gpii.templates.helper.jsonify.getJsonifyFunction",
            "args":     ["{that}"]
        }
    }
});
