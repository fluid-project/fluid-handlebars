
/*
    A client-side Handlebars renderer.  Requires Handlebars.js and Pagedown (for markdown rendering).

    See the docs for more details:

    https://github.com/GPII/gpii-handlebars/blob/master/docs/jsonifyHelper.md

 */
/* global fluid, jQuery */
(function (fluid, $) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.handlebars.renderer");

    gpii.handlebars.renderer.passthrough = function (that, element, key, context, manipulator) {
        element[manipulator](that.render(key, context));
    };

    ["after", "append", "before", "prepend", "replaceWith", "html"].forEach(function (manipulator) {
        gpii.handlebars.renderer[manipulator] = function (that, element, key, context) {
            gpii.handlebars.renderer.passthrough(that, element, key, context, manipulator);
        };
    });

    fluid.defaults("gpii.handlebars.renderer", {
        gradeNames: ["gpii.handlebars.renderer.common"],
        components: {
            "md": {
                "type": "gpii.handlebars.helper.md.client"
            }
        },
        invokers: {
            "after": {
                funcName: "gpii.handlebars.renderer.after",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"] // element, templateName, context
            },
            "append": {
                funcName: "gpii.handlebars.renderer.append",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"] // element, templateName, context
            },
            "before": {
                funcName: "gpii.handlebars.renderer.before",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"] // element, templateName, context
            },
            "html": {
                funcName: "gpii.handlebars.renderer.html",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"] // element, templateName, context
            },
            "prepend": {
                funcName: "gpii.handlebars.renderer.prepend",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"] // element, templateName, context
            },
            "replaceWith": {
                funcName: "gpii.handlebars.renderer.replaceWith",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"] // element, templateName, context
            }
        }
    });

    // The "standalone" renderer grade.
    fluid.defaults("gpii.handlebars.renderer.standalone", {
        gradeNames: ["gpii.handlebars.renderer"],
        messages: {}
    });


    fluid.registerNamespace("gpii.handlebars.renderer.serverAware");
    gpii.handlebars.renderer.serverAware.cacheTemplates = function (that, data) {
        var templates = fluid.filterKeys(data.templates, ["layouts", "pages", "partials"]);

        gpii.handlebars.utils.deleteAndAddModelData(that, "templates", templates);

        // Fire a "templates loaded" event so that components can wait for their markup to appear.
        that.events.onTemplatesLoaded.fire(that);
    };

    gpii.handlebars.renderer.serverAware.retrieveResource = function (url, callback) {
        var settings = {
            url:     url,
            accepts: "application/json",
            success: callback
        };

        $.ajax(settings);
    };

    // A "server aware" grade that depends on being able to communicate with an instance of
    // `gpii.handlebars.inlineTemplateBundlingMiddleware`.

    // SGITHENS: Temporary work around while debugging. For some reason, serverAware is being created
    // instead of serverMessageAware, even though in my codebase I only serverMessageAware. Some other
    // dependency must be beating me to creating the renderer. Temporarily making serverAware have all
    // serverMessageAware
    fluid.defaults("gpii.handlebars.renderer.serverAware", {
        gradeNames: ["gpii.handlebars.renderer"],
        templateUrl: "/hbs",
        invokers: {
            "cacheTemplates": {
                funcName: "gpii.handlebars.renderer.serverAware.cacheTemplates",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"] //  data, textStatus, jqXHR
            }
        },
        events: {
            "onTemplatesLoaded": null,
            "onAllResourcesLoaded": {
                events: {
                    // onMessagesLoaded: "onMessagesLoaded",
                    onTemplatesLoaded: "onTemplatesLoaded"
                }
            }
        },
        listeners: {
            "onCreate.loadTemplates": {
                funcName: "gpii.handlebars.renderer.serverAware.retrieveResource",
                args: ["{that}.options.templateUrl", "{that}.cacheTemplates"] // url, callback
            }
        }
    });

    fluid.registerNamespace("gpii.handlebars.renderer.serverMessageAware");

    /**
     *
     * The message bundling middleware delivers all available languages.  We look at our current locale and save the
     * current bundle to the `messages` model variable.
     *
     * @param {Object} that - The renderer component itself.
     * @param {Object} data - The message bundle for the locale as returned by the server.
     */
    gpii.handlebars.renderer.serverMessageAware.cacheMessages = function (that, data) {
        var transaction = that.applier.initiate();
        transaction.fireChangeRequest({path: "messages", type: "DELETE"});
        transaction.fireChangeRequest({path: "messages", type: "ADD", value: data });
        transaction.commit();

        // Fire a "messages loaded" event so that components can render once they are available.
        that.events.onMessagesLoaded.fire(that);
    };

    fluid.defaults("gpii.handlebars.renderer.serverMessageAware", {
        gradeNames: ["gpii.handlebars.renderer.serverAware", "fluid.modelComponent"],
        messageUrl: "/messages",
        invokers: {
            "cacheMessages": {
                funcName: "gpii.handlebars.renderer.serverMessageAware.cacheMessages",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            }
        },
        events: {
            "onMessagesLoaded": null,
            "onAllResourcesLoaded": {
                events: {
                    onMessagesLoaded: "onMessagesLoaded",
                    onTemplatesLoaded: "onTemplatesLoaded"
                }
            }
        },
        listeners: {
            "onCreate.loadMessages": {
                funcName: "gpii.handlebars.renderer.serverAware.retrieveResource",
                args: ["{that}.options.messageUrl", "{that}.cacheMessages"] // url, callback
            }
        }
    });
})(fluid, jQuery);
