// A client-side module that provides the ability to parse markdown in handlebars.
// This is intended to be added as a child component of a grade that wires in helpers, such as `gpii.templates.hb.client`
//
// Requires Pagedown (for markdown rendering)
/* global fluid, jQuery, Markdown */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.templates.hb.helper.md.client");

    gpii.templates.hb.helper.md.client.initConverter = function (that) {
        if (Markdown && Markdown.getSanitizingConverter) {
            that.options.converter = Markdown.getSanitizingConverter();
            that.events.converterAvailable.fire();
        }
        else {
            console.error("Pagedown or one of its dependencies is not available, so markdown will be passed on without any changes.");
        }
    };

    fluid.defaults("gpii.templates.hb.helper.md.client", {
        gradeNames: ["gpii.templates.hb.helper.md", "autoInit"],
        listeners: {
            onCreate: [
                {
                    funcName: "gpii.templates.hb.helper.md.client.initConverter",
                    args:     ["{that}"]
                }
            ]
        }
    });
})(jQuery);


