// A module that add support for handlebars itself to an express module.
//
// This is designed to be used by adding it to a `gpii.express` instance as a child component.
//
// Any "helper" functions should extend the `gpii.express.helper` grade, and should be added as child components of an instance of this grade.
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.hb");

var exphbs = require("express-handlebars");
var path   = require("path");
var fs     = require("fs");

require("handlebars");

gpii.express.addHelper = function (that, component) {
    var key = component.options.helperName;
    if (component.getHelper) {
        that.helpers[key] = component.getHelper();
    }
    else {
        fluid.fail("Can't register helper '" + key + "' because it doesn't have a getHelper() invoker.");
    }
};

gpii.express.configureExpress = function (that, express) {
    if (that.options.config.express.views) {
        var viewDirs     = fluid.makeArray(that.options.config.express.views);
        var layoutDir    = null;
        var partialsDirs = [];
        fluid.each(viewDirs, function (viewDir) {
            // We can only use the first layouts directory until this issue is resolved in express-handlebars:
            //
            // https://github.com/ericf/express-handlebars/issues/112
            if (!layoutDir) {
                var layoutPath = path.resolve(viewDir, "layouts");
                if (fs.existsSync(layoutPath)) {
                    layoutDir = layoutPath;
                }
            }

            // We add entries in reverse order to preserve the same inheritance we see with pages.
            partialsDirs.unshift(viewDir + "/partials/");
        });

        var handlebarsConfig = {
            defaultLayout: "main",
            layoutsDir:    layoutDir,
            partialsDir:   partialsDirs
        };

        handlebarsConfig.helpers = that.helpers;

        express.set("views", that.options.config.express.views);

        var hbs = exphbs.create(handlebarsConfig);
        express.engine("handlebars", hbs.engine);
        express.set("view engine", "handlebars");
    }
    else {
        fluid.fail("Cannot initialize template handling without a 'config.express.views' option");
    }
};

fluid.defaults("gpii.express.hb", {
    gradeNames: ["fluid.modelComponent"],
    config:     "{expressConfigHolder}.options.config",
    express:    "{gpii.express}.express",
    members: {
        helpers: {}
    },
    model: {},    // We should have an empty model, as the dispatcher expects to expose that.
    distributeOptions: [
        {
            record: {
                "funcName": "gpii.express.addHelper",
                "args": ["{gpii.express.hb}", "{gpii.templates.helper}"]
            },
            target: "{that > gpii.templates.helper}.options.listeners.onCreate"
        }
    ],
    components: {
        md: {
            type: "gpii.templates.helper.md.server"
        },
        equals: {
            type: "gpii.templates.helper.equals"
        },
        jsonify: {
            type: "gpii.templates.helper.jsonify"
        },
        initBlock: {
            type: "gpii.templates.helper.initBlock"
        }
    },
    listeners: {
        "{gpii.express}.events.onStarted": {
            funcName: "gpii.express.configureExpress",
            args:     ["{that}", "{arguments}.0"]
        }
    }
});