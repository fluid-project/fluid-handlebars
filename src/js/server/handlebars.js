// A module that add support for handlebars itself to an express module.
//
// This is designed to be used by adding it to a `gpii.express` instance as a child component.
//
// Any "helper" functions should extend the `gpii.express.hb.helper` grade, and should be added as child components of an instance of this grade.
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.hb");

var exphbs      = require("express-handlebars");
require("handlebars");

gpii.express.hb.configureExpress = function (that, express) {
    if (that.options.config.express.views) {
        var viewRoot = that.options.config.express.views;
        var handlebarsConfig = {
            defaultLayout: "main",
            layoutsDir:    viewRoot + "/layouts/",
            partialsDir:   viewRoot + "/partials/"
        };

        handlebarsConfig.helpers = that.getHelpers();

        express.set("views", viewRoot);

        var hbs = exphbs.create(handlebarsConfig);
        express.engine("handlebars", hbs.engine);
        express.set("view engine", "handlebars");
    }
    else {
        console.error("Cannot initialize template handling without a 'config.express.views' option");
    }
};

gpii.express.hb.getHelpers = function (that) {
    var functions = {};
    if (that.options.components) {
        var components = Object.keys(that.options.components);
        for (var a = 0; a < components.length; a++) {
            var key = components[a];
            var component = that[key];
            if (fluid.hasGrade(component.options, "gpii.templates.hb.helper")) {
                functions[key] = component.getHelper();
            }
        }
    }
    else {
        console.log("No components are configured, which means no helpers will be added.");
    }
    return functions;
};

fluid.defaults("gpii.express.hb", {
    gradeNames: ["fluid.eventedComponent", "fluid.modelRelayComponent", "autoInit"],
    config:     "{gpii.express}.options.config",
    express:    "{gpii.express}.express",
    model: {},    // We should have an empty model, as the dispatcher expects to expose that.
    components: {
        md: {
            type: "gpii.templates.hb.helper.md.server"
        },
        jsonify: {
            type: "gpii.templates.hb.helper.jsonify"
        }
    },
    invokers: {
        getHelpers: {
            funcName: "gpii.express.hb.getHelpers",
            args:     ["{that}"]
        }
    },
    listeners: {
        "{gpii.express}.events.started": {
            funcName: "gpii.express.hb.configureExpress",
            args:     ["{that}", "{arguments}.0"]
        }
    }
});