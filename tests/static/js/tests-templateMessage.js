"use strict";
// Test the "template message" component.
//
// This is a test component that is meant to be included in a client-side document.
//
/* global fluid */

fluid.defaults("gpii.tests.templateMessage", {
    gradeNames: ["gpii.templates.templateMessage", "gpii.templates.templateAware.bornReady", "autoInit"],
    template:   "common-success",
    components: {
        renderer: {
            type: "gpii.templates.renderer",
            options: {
                members: {
                    templates: {
                        partials: {
                            "common-success": "<div class=\"alert-box success\">{{message}}</div>"
                        }
                    }
                }
            }
        }
    }
});

fluid.defaults("gpii.tests.templateMessage.initialized", {
    gradeNames: ["gpii.tests.templateMessage", "autoInit"],
    model: {
        message: "I was born with silver model data in my mouth."
    }
});

fluid.defaults("gpii.tests.templateMessage.updated", {
    gradeNames: ["gpii.tests.templateMessage", "autoInit"],
    model:      {}
});