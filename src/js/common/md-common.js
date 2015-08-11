// A base gradeName that provides a markdown-parsing helper for handlebars.
//
// NOTE:  This grade should not be used directly, you should add either the server or client appropriate gradeName to the appropriate list of components.
//
//  For your convenience, here are those grade names:
//  _server_: `gpii.templates.helper.md.server`
//  _client_: `gpii.templates.helper.md.client`

"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.templates.helper.md");

gpii.templates.helper.md.getMdFunction = function (that) {
    return function (context) {
        if (!context) {
            fluid.fail("No context was provided, ignoring markdown helper call.");
        }
        else if (that && that.options && that.converter) {
            return that.converter.makeHtml(context);
        }
        else {
            fluid.fail("Can't convert markdown content because the converter could not be found.");
        }

        // If we can't evolve the output, we just pass it through.
        return context;
    };
};

gpii.templates.helper.md.configureConverter = function (that) {
    if (that.converter) {
        // Double all single carriage returns so that they result in new paragraphs, at least for now
        that.converter.hooks.chain("preConversion", function (text) { return text.replace(/[\r\n]+/g, "\n\n"); });
    }
    else {
        fluid.fail("Could not initialize pagedown converter.  Markdown content will not be parsed.");
    }
};

fluid.defaults("gpii.templates.helper.md", {
    gradeNames: ["gpii.templates.helper", "autoInit"],
    helperName: "md",
    members: {
        converter: null
    },
    invokers: {
        "getHelper": {
            "funcName": "gpii.templates.helper.md.getMdFunction",
            "args":     ["{that}"]
        }
    },
    events: {
        "converterAvailable": null
    },
    listeners: {
        "converterAvailable": {
            funcName: "gpii.templates.helper.md.configureConverter",
            args:     ["{that}"]
        }
    }
});
