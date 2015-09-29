"use strict";
// Test all "template aware" components.
//
// This is a test component that is meant to be included in a client-side document.
//
/* global fluid */
fluid.registerNamespace("gpii.tests.templateFormControl");

fluid.defaults("gpii.tests.templateFormControl", {
    gradeNames: ["gpii.templates.templateFormControl", "gpii.templates.templateAware.serverAware"],
    templates: {
        success: "common-success",
        error:   "common-error"
    },
    distributeOptions: {
        source: "{that}.options.invokers.getRenderer",
        target: "{that templateAware}.options.invokers.getRenderer"
    },
    rules: {
        successResponseToModel: {
            successMessage: { literalValue: "The response was successful..." }
        },
        errorResponseToModel: {
            errorMessage: { literalValue: "The response was not successful..." }
        }
    }
});

fluid.defaults("gpii.tests.templateFormControl.readyForSuccess", {
    gradeNames: ["gpii.tests.templateFormControl"],
    ajaxOptions: {
        url:    "/content/json/success.json"
    },
    model: {
        buttonName: "Succeed"
    },
    templates: {
        initial: "form-success-initial",
        success: "form-success"
    }
});

fluid.defaults("gpii.tests.templateFormControl.readyForGetSuccess", {
    gradeNames: ["gpii.tests.templateFormControl.readyForSuccess"],
    ajaxOptions: {
        method: "GET"
    },
    model: {
        buttonName: "Get Successful"
    }
});

fluid.defaults("gpii.tests.templateFormControl.readyForStringifySuccess", {
    gradeNames: ["gpii.tests.templateFormControl.readyForSuccess"],
    ajaxOptions: {
        url:      "/content/stringifySuccess.txt",
        dataType: "json"
    },
    model: {
        buttonName: "Stringify Succeed"
    }
});

fluid.defaults("gpii.tests.templateFormControl.readyForStringSuccess", {
    gradeNames: ["gpii.tests.templateFormControl.readyForSuccess"],
    ajaxOptions: {
        url:      "/content/stringSuccess.txt"
    },
    rules: {
        successResponseToModel: {
            ok:             false,
            successMessage: "responseText"
        }
    },
    model: {
        buttonName: "String Succeed"
    }
});

fluid.defaults("gpii.tests.templateFormControl.readyForFailure", {
    gradeNames: ["gpii.tests.templateFormControl"],
    ajaxOptions: {
        url: "/error"
    },
    model: {
        buttonName: "Fail"
    },
    templates: {
        initial: "form-failure-initial"
    }
});

fluid.defaults("gpii.tests.templateFormControl.readyForStringifyFailure", {
    gradeNames: ["gpii.tests.templateFormControl"],
    ajaxOptions: {
        url: "/errorJsonString"
    },
    model: {
        buttonName: "Stringify Fail"
    },
    templates: {
        initial: "form-failure-initial"
    }
});

fluid.defaults("gpii.tests.templateFormControl.readyForStringFailure", {
    gradeNames: ["gpii.tests.templateFormControl"],
    ajaxOptions: {
        url: "/errorString"
    },
    model: {
        buttonName: "String Fail"
    },
    rules: {
        errorResponseToModel: {
            ok:           false,
            errorMessage: ""
        }
    },
    templates: {
        initial: "form-failure-initial"
    }
});


fluid.defaults("gpii.tests.templateFormControl.readyForKeys", {
    gradeNames:    ["gpii.tests.templateFormControl"],
    hideOnSuccess: false,
    ajaxOptions: {
        url: "/content/json/success.json"
    },
    templates: {
        initial: "form-keyed-initial"
    }
});