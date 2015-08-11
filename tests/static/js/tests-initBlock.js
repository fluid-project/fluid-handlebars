"use strict";
// Test the base "template aware" component.
//
// This is a test component that is meant to be included in a client-side document.
//
/* global fluid */
(function () {
    fluid.defaults("gpii.tests.initBlock", {
        gradeNames: ["gpii.templates.templateAware", "autoInit"],
        template:   "index",
        selectors: {
            initial: ".initBlock-viewport"
        },
        model: {
            hasDataFromGrade: true
        },
        invokers: {
            renderInitialMarkup: {
                func: "{that}.renderMarkup",
                args: [ "initial", "{that}.options.template", "{that}.model"]
            }
        }
    });
})();
