// Server-side wrapper to add a markdown parsing helper.
//
// This is designed to be included as a child component of `gpii.express.hb`
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.templates.hb.helper.md.server");

var pagedown       = require("pagedown");

gpii.templates.hb.helper.md.server.initConverter = function (that) {
    var converter = pagedown.getSanitizingConverter();
    that.options.converter = converter;
    that.events.converterAvailable.fire();
};

fluid.defaults("gpii.templates.hb.helper.md.server", {
    gradeNames: ["gpii.templates.hb.helper.md", "autoInit"],
    listeners: {
        onCreate: [
            {
                funcName: "gpii.templates.hb.helper.md.server.initConverter",
                args:     ["{that}"]
            }
        ]

    }
});
