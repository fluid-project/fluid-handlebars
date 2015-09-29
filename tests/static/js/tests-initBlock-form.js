"use strict";
// Test the template form control component from within an initBlock-generated page.
//
// This is a test component that is meant to be included in a client-side document.
//
/* global fluid */
(function () {
    fluid.defaults("gpii.tests.initBlock.form", {
        gradeNames: ["gpii.templates.templateAware.serverAware", "gpii.templates.templateFormControl"],
        templates: {
            initial: "form-success-initial",
            success: "form-success",
            error:   "common-error"
        },
        rules: {
            successResponseToModel: {
                successMessage: { literalValue: "The response was successful..." }
            },
            errorResponseToModel: {
                errorMessage: { literalValue: "The response was not successful..." }
            }
        },
        ajaxOptions: {
            url:    "/content/json/success.json"
        },
        model: {
            buttonName: "Succeed"
        },
        selectors: {
            initial: ".initBlock-viewport"
        }
    });
})();
