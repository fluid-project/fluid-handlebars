"use strict";
// Test rendering functions independently of the `testAware` infrastructure.
//
// This is a test component that is meant to be included in a client-side document.
/* global fluid, gpii */
fluid.registerNamespace("gpii.clientTests");

gpii.clientTests.transformUsingTemplates = function (that) {

    var renderer = that.getRenderer();
    renderer.after(that.locate("viewport-after"), that.options.templateName, that.model);
    renderer.append(that.locate("viewport-append"), that.options.templateName, that.model);
    renderer.before(that.locate("viewport-before"), that.options.templateName, that.model);
    renderer.html(that.locate("viewport-html"), that.options.templateName, that.model);
    renderer.prepend(that.locate("viewport-prepend"), that.options.templateName, that.model);
    renderer.replaceWith(that.locate("viewport-replaceWith"), that.options.replaceWithTemplateName, that.model);
};

fluid.defaults("gpii.clientTests", {
    gradeNames: ["gpii.templates.templateAware.serverAware"],
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
    invokers: {
        "renderInitialMarkup": {
            funcName: "gpii.clientTests.transformUsingTemplates",
            args:     ["{that}"]
        }
    }
});