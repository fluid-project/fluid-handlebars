/*
  A fluid-component for use with express.js that routes requests to the appropriate layout and page (if available).

  Any data that is visible in the instance's model variable will be passed along to the template renderer and available for use in your handlebars templates.
 */
"use strict";
var fluid      = fluid || require("infusion");
var gpii       = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.hb.dispatcher");

var fs         = require("fs");
var path       = require("path");

gpii.express.hb.dispatcher.getRouter = function (that) {
    return function (req, res) {
        var template = req.params.template ? req.params.template : that.options.defaultTemplate;
        var templateName = template + ".handlebars";

        var viewDir          = that.options.config.express.views;
        var templateRelPath  = path.join("pages", templateName);
        var layoutFilename   = templateName;
        var layoutFullPath   = path.join(viewDir, "layouts", layoutFilename);
        if (!fs.existsSync(layoutFullPath)) {
            layoutFilename = "main.handlebars";
        }

        var templateFullPath = path.join(viewDir, templateRelPath);
        if (fs.existsSync(templateFullPath)) {
            var options    = that.model ? fluid.copy(that.model): {};
            options.layout = layoutFilename;
            options.req    = req;
            res.render(templateRelPath, options);
        }
        else {
            var errorRelPath = path.join(viewDir, "pages", "error.handlebars");
            res.status(404).render(errorRelPath, {message: "The template you requested ('" + templateName + "') was not found."});
        }
    };
};

fluid.defaults("gpii.express.hb.dispatcher", {
    gradeNames: ["gpii.express.router", "fluid.standardRelayComponent", "autoInit"],
    method:          "get",
    defaultTemplate: "index",
    // In most cases you will want to supply both a path with a variable, and one without, as in:
    //
    // path:            ["/:template", "/"],
    //
    // This will ensure that the root content handling (which defaults to using `index.handlebars`) responds to the
    // root of the path.
    //
    config:          "{expressConfigHolder}.options.config",
    invokers: {
        "getRouter": {
            funcName: "gpii.express.hb.dispatcher.getRouter",
            args: ["{that}"]
        }
    }
});