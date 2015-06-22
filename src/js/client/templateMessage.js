// A simple component that is designed to display content using a named template, or nothing if there is no content.
//
// This is meant to be used mainly as a subcomponent in a more complex panel of controls.  It is not responsible for
// request handling or anything other than updating the display when its model changes.
//
// Any changes to `model.message` will result in a full refresh.  You are expected to handle everything else in your template,
// including whether to display anything at all.
//
/* global fluid, jQuery */
(function () {
    "use strict";

    fluid.registerNamespace("gpii.templates.hb.client.templateMessage");
    gpii.templates.hb.client.templateMessage.noop = function () {};
    fluid.defaults("gpii.templates.hb.client.templateMessage", {
        gradeNames:  ["gpii.templates.hb.client.templateAware", "autoInit"],
        template:    "common-message",
        manipulator: "html", // By default, we replace the contents of our container, but not the container itself.
        selectors: {
            message: "" // By default, we operate on the entire container.
        },
        model: {
            message: null
        },
        modelListeners: {
            "message": {
                func:          "{that}.refresh",
                excludeSource: "init"
            }
        },
        invokers: {
            refresh: {
                funcName: "gpii.templates.hb.client.templateAware.renderMarkup",
                args: ["{that}", "message", "{that}.options.template", "{that}.model.message", "{that}.options.manipulator"]
            },
            renderInitialMarkup: {
                funcName: "gpii.templates.hb.client.templateMessage.noop"
            }
        }
    });
})(jQuery);