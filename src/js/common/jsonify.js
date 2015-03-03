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
fluid.registerNamespace("gpii.templates.hb.helper.jsonify");


gpii.templates.hb.helper.jsonify.getJsonifyFunction = function () {
    return function (context) {
        try {
            return JSON.stringify(context);
        }
        catch (e) {
            console.log("Can't convert JSON object to string: " + e);
            return context;
        }
    };
};

fluid.defaults("gpii.templates.hb.helper.jsonify", {
    gradeNames: ["gpii.templates.hb.helper", "autoInit"],
    invokers: {
        "getHelper": {
            "funcName": "gpii.templates.hb.helper.jsonify.getJsonifyFunction",
            "args":     ["{that}"]
        }
    }
});
