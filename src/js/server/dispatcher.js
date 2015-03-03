/*
  A fluid-component for use with express.js that routes requests to the appropriate layout and page (if available).

  Any data that is visible in the instance's model variable will be passed along to the template renderer and available for use in your handlebars templates.
 */
"use strict";
var fluid      = fluid || require("infusion");
var gpii       = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.hb.dispatcher");

var fs         = require("fs");

gpii.express.hb.dispatcher.getRouterFunction = function (that) {
    return function (req, res) {
        var templateName = req.params.template;

        var viewDir      = that.options.config.express.views;
        var pagesDir     = viewDir + "/pages/";
        var layoutDir    = viewDir + "/layouts/";
        var filename     = pagesDir + templateName + ".handlebars";
        if (fs.existsSync(filename)) {
            var layoutFilename = fs.existsSync(layoutDir + templateName + ".handlebars") ? templateName : "main";
            var options        = that.model ? JSON.parse(JSON.stringify(that.model)): {};
            options.layout     = layoutDir + layoutFilename + ".handlebars";
            options.req        = req;
            res.render(pagesDir + templateName + ".handlebars", options);
        }
        else {
            res.status(404).render(pagesDir + "error.handlebars", {message: "The page you requested ('" + templateName + "') was not found."});
        }
    };
};

fluid.defaults("gpii.express.hb.dispatcher", {
    gradeNames: ["gpii.express.router", "autoInit"],
    method: "get",
    path:   "/dispatcher/:template",
    invokers: {
        "getRouterFunction": {
            funcName: "gpii.express.hb.dispatcher.getRouterFunction",
            args: ["{that}"]
        }
    }
});