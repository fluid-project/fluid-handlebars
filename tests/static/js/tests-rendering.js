"use strict";
// Test rendering functions independently of the `testAware` infrastructure.
//
// This is a test component that is meant to be included in a client-side document.
/* global fluid, gpii, jqUnit */
fluid.registerNamespace("gpii.hb.clientTests");

gpii.hb.clientTests.transformUsingTemplates = function (that) {
    that.templates.after(that.locate("viewport-after"), that.options.templateName, that.model);
    that.templates.append(that.locate("viewport-append"), that.options.templateName, that.model);
    that.templates.before(that.locate("viewport-before"), that.options.templateName, that.model);
    that.templates.html(that.locate("viewport-html"), that.options.templateName, that.model);
    that.templates.prepend(that.locate("viewport-prepend"), that.options.templateName, that.model);
    that.templates.replaceWith(that.locate("viewport-replaceWith"), that.options.replaceWithTemplateName, that.model);
};

fluid.defaults("gpii.hb.clientTests", {
    gradeNames: ["fluid.viewRelayComponent", "autoInit"],
    model: {
        myvar:                   "modelvariable",
        markdown:                "*this works*",
        json:                    { foo: "bar", baz: "quux", qux: "quux" }
    },
    templateName:            "index",
    replaceWithTemplateName: "replace",
    selectors: {
        "viewport-after":       ".viewport-after",
        "viewport-append":      ".viewport-append",
        "viewport-before":      ".viewport-before",
        "viewport-html":        ".viewport-html",
        "viewport-prepend":     ".viewport-prepend",
        "viewport-replaceWith": ".viewport-replaceWith"
    },
    components: {
        templates: {
            type: "gpii.templates.hb.client"
        }
    },
    listeners: {
        "{templates}.events.onTemplatesLoaded": {
            funcName: "gpii.hb.clientTests.transformUsingTemplates",
            args:     ["{that}"]
        }
    }
});