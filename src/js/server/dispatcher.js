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

gpii.express.dispatcher.route = function (that, req, res) {
    var template     = req.params.template ? req.params.template : that.options.defaultTemplate;
    var templateName = template + ".handlebars";

    var layoutName   = templateName;

    var layoutExists   = false;
    var templateExists = false;
    var viewDirs = fluid.makeArray(that.options.config.express.views);
    fluid.each(viewDirs, function (viewDir) {
        var layoutPath = path.join(viewDir, "layouts", templateName);
        if (fs.existsSync(layoutPath)) {
            layoutExists = true;
        }

        var templatePath = path.join(viewDir, "pages", templateName);
        if (fs.existsSync(templatePath)) {
            templateExists = true;
        }
    });

    if (!layoutExists) {
        layoutName = that.options.defaultLayout;
    }

    if (!templateExists) {
        templateName = that.options.errorPage;
    }
    var rules           = templateExists ? that.options.rules.contextToExpose : that.options.rules.errorContext;
    var contextToExpose = fluid.model.transformWithRules({ model: that.model, req: req, layout: layoutName }, rules);
    var statusCode      = templateExists ? 200 : 404;

    res.status(statusCode).render(path.join("pages", templateName), contextToExpose);
};

fluid.defaults("gpii.express.dispatcher", {
    gradeNames:      ["gpii.express.router", "fluid.modelComponent"],
    method:          "get",
    defaultTemplate: "index",
    defaultLayout:   "main.handlebars",
    errorPage:       "error.handlebars",
    rules: {
        contextToExpose: {
            "layout": "layout", // This is required to support custom layouts
            "user":   "req.session.user",
            "req":  {
                "query":  "req.query",
                "params": "req.params"
            }
        },
        errorContext: {
            "layout": "layout", // This is required to support custom layouts
            message: {
                literalValue: "The page you requested was not found."
            }
        }
    },
    // In most cases you will want to supply both a path with a variable, and one without, as in:
    //
    // path:            ["/:template", "/"],
    //
    // This will ensure that the root content handling (which defaults to using `index.handlebars`) responds to the
    // root of the path.
    //
    config:          "{expressConfigHolder}.options.config",
    invokers: {
        route: {
            funcName: "gpii.express.dispatcher.route",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        }
    }
});