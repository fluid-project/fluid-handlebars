// Server-side wrapper to add a markdown parsing helper.
//
// This is designed to be included as a child component of `gpii.express.hb`
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.templates.helper.md.server");

var pagedown = require("pagedown");

gpii.templates.helper.md.server.initConverter = function (that) {
    var converter = pagedown.getSanitizingConverter();
    that.converter = converter;
    that.events.converterAvailable.fire();
};

fluid.defaults("gpii.templates.helper.md.server", {
    gradeNames: ["gpii.templates.helper.md", "autoInit"],
    listeners: {
        onCreate: [
            {
                funcName: "gpii.templates.helper.md.server.initConverter",
                args:     ["{that}"]
            }
        ]

    }
});
