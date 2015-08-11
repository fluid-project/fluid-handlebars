// A client-side module that provides various template handling capabilities, and which wires in any
// child components with the grade `gpii.templates.helper` as handlebars helpers.
//
// For tests and other simple uses, you can directly use the `gpii.templates.renderer` grade.  If you are working with
// templates provided by the `inline` router included with this package, you should add
// `gpii.templates.serverAware` to `options.gradeNames`.
//
// Requires Handlebars.js and Pagedown (for markdown rendering)

/* global fluid, jQuery, Handlebars */
(function ($) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.templates.renderer");

    /** @namespace gpii.templates.hb */
    gpii.templates.renderer.addHelper = function (that, component) {
        var key = component.options.helperName;
        if (component.getHelper) {
            that.helpers[key] = component.getHelper();
        }
        else {
            fluid.fail("Can't register helper '" + key + "' because it doesn't have a getHelper() invoker.");
        }
    };

    gpii.templates.renderer.registerHelpers = function (that) {
        if (Handlebars) {
            fluid.each(that.helpers, function (value, key) {
                Handlebars.registerHelper(key, value);
            });
        }
        else {
            fluid.fail("Handlebars is not available, so we cannot wire in our helpers.");
        }
    };

    gpii.templates.renderer.render = function (that, templateName, context) {
        var templateType = that.templates.partials[templateName] ? "partials" : that.templates.pages[templateName] ? "pages" : that.templates.layouts[templateName] ? "layouts" : null;
        if (!templateType) {
            fluid.fail("Can't find template '" + templateName + "'...");
        }

        // TODO:  Cleanly separate the caching responsibility into a new grade.
        // Cache each compiled template the first time we use it...
        if (!that.compiled[templateType][templateName]) {
            var compiledTemplate = Handlebars.compile(that.templates[templateType][templateName]);

            that.compiled[templateType][templateName] = compiledTemplate;
        }

        return that.compiled[templateType][templateName](context);
    };

    gpii.templates.renderer.passthrough = function (that, element, key, context, manipulator) {
        element[manipulator](gpii.templates.renderer.render(that, key, context));
    };

    ["after", "append", "before", "prepend", "replaceWith", "html"].forEach(function (manipulator) {
        gpii.templates.renderer[manipulator] = function (that, element, key, context) {
            gpii.templates.renderer.passthrough(that, element, key, context, manipulator);
        };
    });

    gpii.templates.renderer.loadPartials  = function (that) {
        fluid.each(that.templates.partials, function (value, key) {
            Handlebars.registerPartial(key, value);
        });
    };

    fluid.defaults("gpii.templates.renderer", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        components: {
            "md": {
                "type": "gpii.templates.helper.md.client"
            },
            "equals": {
                "type": "gpii.templates.helper.equals"
            },
            "jsonify": {
                "type": "gpii.templates.helper.jsonify"
            }
        },
        members: {
            helpers:   {},
            templates: {
                layouts:  {},
                pages:    {},
                partials: {}
            },
            compiled:  {
                layouts:  {},
                pages:    {},
                partials: {}
            }
        },
        distributeOptions: [
            {
                record: {
                    "funcName": "gpii.templates.renderer.addHelper",
                    "args": ["{gpii.templates.renderer}", "{gpii.templates.helper}"]
                },
                target: "{that gpii.templates.helper}.options.listeners.onCreate"
            }
        ],
        invokers: {
            "after": {
                funcName: "gpii.templates.renderer.after",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
            },
            "append": {
                funcName: "gpii.templates.renderer.append",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
            },
            "before": {
                funcName: "gpii.templates.renderer.before",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
            },
            "body": {
                funcName: "gpii.templates.renderer.body",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
            },
            "html": {
                funcName: "gpii.templates.renderer.html",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
            },
            "prepend": {
                funcName: "gpii.templates.renderer.prepend",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
            },
            "replaceWith": {
                funcName: "gpii.templates.renderer.replaceWith",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
            }
        },
        listeners: {
            "onCreate.registerHelpers": {
                funcName: "gpii.templates.renderer.registerHelpers",
                args:     ["{that}", "{arguments}.0"]
            },
            "onCreate.loadPartials": {
                funcName: "gpii.templates.renderer.loadPartials",
                args:     ["{that}"]
            }
        }
    });


    fluid.registerNamespace("gpii.templates.renderer.serverAware");
    gpii.templates.renderer.serverAware.cacheTemplates = function (that, data) {
        ["layouts", "pages", "partials"].forEach(function (key) {
            if (data.templates[key]) {
                that.templates[key] = data.templates[key];
            }
        });

        gpii.templates.renderer.loadPartials(that);

        // Fire a "templates loaded" event so that components can wait for their markup to appear.
        that.events.onTemplatesLoaded.fire(that);
    };

    gpii.templates.renderer.serverAware.retrieveTemplates = function (that) {
        var settings = {
            url:     that.options.templateUrl,
            success: that.cacheTemplates
        };

        $.ajax(settings);
    };

    fluid.defaults("gpii.templates.renderer.serverAware", {
        gradeNames: ["gpii.templates.renderer", "autoInit"],
        templateUrl: "/hbs",
        invokers: {
            "cacheTemplates": {
                funcName: "gpii.templates.renderer.serverAware.cacheTemplates",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            "retrieveTemplates": {
                funcName: "gpii.templates.renderer.serverAware.retrieveTemplates",
                args: ["{that}", "{arguments}.0"]
            }
        },
        events: {
            "onTemplatesLoaded": null
        },
        listeners: {
            "onCreate.loadTemplates": {
                func: "{that}.retrieveTemplates"
            }
        }
    });
})(jQuery);


