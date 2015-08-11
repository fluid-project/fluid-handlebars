/*
  A fluid-component for use with express.js that routes requests to the appropriate layout and page (if available).

  The data exposed to handlebars is controlled using the transformation rules found in `options.rules.contextToExpose`.

  By default, the request object is exposed.  To disable this, you will need to use a configuration block like:

  rules: {
    contextToExpose: {
      req: "notfound" // point to a variable that does not exist to remove this from the results
    }
  }

 */
"use strict";
var fluid      = fluid || require("infusion");
var gpii       = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.dispatcher");

var fs         = require("fs");
var path       = require("path");

gpii.express.dispatcher.getRouter = function (that) {
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
            var contextToExpose = fluid.model.transformWithRules({ model: that.model, req: req }, that.options.rules.contextToExpose);

            // We have to add the layout to the context in order to use a custom layout.
            contextToExpose.layout = layoutFilename;

            res.render(templateRelPath, contextToExpose);
        }
        else {
            var errorRelPath = path.join(viewDir, "pages", "error.handlebars");
            res.status(404).render(errorRelPath, {message: "The template you requested ('" + templateName + "') was not found."});
        }
    };
};

fluid.defaults("gpii.express.dispatcher", {
    gradeNames: ["gpii.express.router", "fluid.standardRelayComponent", "autoInit"],
    method:     "get",
    rules: {
        contextToExpose: {
            "user":   "req.session.user",
            "req":  {
                "query":  "req.query",
                "params": "req.params"
            }
        }
    },
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
            funcName: "gpii.express.dispatcher.getRouter",
            args: ["{that}"]
        }
    }
});