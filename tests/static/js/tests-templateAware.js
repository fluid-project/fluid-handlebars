"use strict";
// Test the base "template aware" component.
//
// This is a test component that is meant to be included in a client-side document.
//
/* global fluid */
fluid.registerNamespace("gpii.hb.tests.templateAware");

fluid.defaults("gpii.hb.tests.templateAware", {
    gradeNames: ["gpii.templates.hb.client.templateAware", "autoInit"],
    template:   "index",
    selectors: {
        initial: "" // Update the whole container
    },
    model: {
        myvar:    "modelvariable",
        markdown: "*this works*",
        json:     { foo: "bar", baz: "quux", qux: "quux" }
    },
    invokers: {
        renderInitialMarkup: {
            funcName: "gpii.templates.hb.client.templateAware.renderMarkup",
            args: [
                "{that}",
                "initial",
                "{that}.options.template",
                "{that}.model",
                "html"
            ]
        }
    }
});

fluid.registerNamespace("gpii.hb.tests.templateAware.contained");
fluid.defaults("gpii.hb.tests.templateAware.contained", {
    gradeNames: ["gpii.hb.tests.templateAware", "autoInit"],
    template:  "form-contained-initial",
    selectors: {
        initial: ".contained-inner" // Update an interior element without disturbing the root container.
    }
});