// A module that add support for handlebars itself to an express module.
//
// This is designed to be used by adding it to a `gpii.express` instance as a child component.
//
// Any "helper" functions should extend the `gpii.express.helper` grade, and should be added as child components of an instance of this grade.
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.hb");

var exphbs = require("express-handlebars");
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
        var viewRoot = that.options.config.express.views;
        var handlebarsConfig = {
            defaultLayout: "main",
            layoutsDir:    viewRoot + "/layouts/",
            partialsDir:   viewRoot + "/partials/"
        };

        handlebarsConfig.helpers = that.helpers;

        express.set("views", viewRoot);

        var hbs = exphbs.create(handlebarsConfig);
        express.engine("handlebars", hbs.engine);
        express.set("view engine", "handlebars");
    }
    else {
        fluid.fail("Cannot initialize template handling without a 'config.express.views' option");
    }
};

fluid.defaults("gpii.express.hb", {
    gradeNames: ["fluid.eventedComponent", "fluid.modelRelayComponent", "autoInit"],
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