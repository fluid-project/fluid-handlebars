"use strict";
// Test all "template aware" components.
//
// This is a test component that is meant to be included in a client-side document.
//
/* global fluid */
fluid.registerNamespace("gpii.hb.tests.templateFormControl");

fluid.defaults("gpii.hb.tests.templateFormControl", {
    gradeNames: ["gpii.templates.hb.client.templateFormControl", "autoInit"],
    templates: {
        success: "common-success",
        error:   "common-error"
    }
});

fluid.registerNamespace("gpii.hb.tests.templateFormControl.readyForSuccess");
fluid.defaults("gpii.hb.tests.templateFormControl.readyForSuccess", {
    gradeNames: ["gpii.hb.tests.templateFormControl", "autoInit"],
    ajaxUrl: "/content/json/success.json",
    model: {
        buttonName: "Succeed"
    },
    rules: {
        success: {
            "":     "notfound",
            record: "responseJSON.record"
        }
    },
    templates: {
        initial: "form-success-initial",
        success: "form-success"
    }
});

fluid.registerNamespace("gpii.hb.tests.templateFormControl.readyForStringifySuccess");
fluid.defaults("gpii.hb.tests.templateFormControl.readyForStringifySuccess", {
    gradeNames: ["gpii.hb.tests.templateFormControl.readyForSuccess", "autoInit"],
    ajaxUrl: "/content/stringifySuccess.txt",
    ajaxOptions: {
        dataType: "json"
    },
    model: {
        buttonName: "Stringify Succeed"
    }
});

fluid.registerNamespace("gpii.hb.tests.templateFormControl.readyForStringSuccess");
fluid.defaults("gpii.hb.tests.templateFormControl.readyForStringSuccess", {
    gradeNames: ["gpii.hb.tests.templateFormControl.readyForSuccess", "autoInit"],
    ajaxUrl: "/content/stringSuccess.txt",
    rules: {
        success: {
            ok:     false,
            message: "responseText"
        }
    },
    model: {
        buttonName: "String Succeed"
    }
});

fluid.registerNamespace("gpii.hb.tests.templateFormControl.readyForFailure");
fluid.defaults("gpii.hb.tests.templateFormControl.readyForFailure", {
    gradeNames: ["gpii.hb.tests.templateFormControl", "autoInit"],
    ajaxUrl: "/error",
    model: {
        buttonName: "Fail"
    },
    templates: {
        initial: "form-failure-initial"
    }
});

fluid.registerNamespace("gpii.hb.tests.templateFormControl.readyForStringifyFailure");
fluid.defaults("gpii.hb.tests.templateFormControl.readyForStringifyFailure", {
    gradeNames: ["gpii.hb.tests.templateFormControl", "autoInit"],
    ajaxUrl: "/errorJsonString",
    model: {
        buttonName: "Stringify Fail"
    },
    templates: {
        initial: "form-failure-initial"
    }
});

fluid.registerNamespace("gpii.hb.tests.templateFormControl.readyForStringFailure");
fluid.defaults("gpii.hb.tests.templateFormControl.readyForStringFailure", {
    gradeNames: ["gpii.hb.tests.templateFormControl", "autoInit"],
    ajaxUrl: "/errorString",
    model: {
        buttonName: "String Fail"
    },
    rules: {
        error: {
            ok:     false,
            message: "responseText"
        }
    },
    templates: {
        initial: "form-failure-initial"
    }
});

fluid.registerNamespace("gpii.hb.tests.templateFormControl.readyForAmbiguity");
fluid.defaults("gpii.hb.tests.templateFormControl.readyForAmbiguity", {
    gradeNames: ["gpii.hb.tests.templateFormControl", "autoInit"],
    ajaxUrl: "/content/json/error.json", // An error, delivered with a 200 status code.
    model: {
        buttonName: "Dither"
    },
    templates: {
        initial: "form-ambiguous-initial",
        error:   "form-ambiguous-error"
    }
});


fluid.registerNamespace("gpii.hb.tests.templateFormControl.readyForKeys");
fluid.defaults("gpii.hb.tests.templateFormControl.readyForKeys", {
    gradeNames:    ["gpii.hb.tests.templateFormControl", "autoInit"],
    hideOnSuccess: false,
    ajaxUrl: "/content/json/success.json",
    templates: {
        initial: "form-keyed-initial"
    }
});

fluid.registerNamespace("gpii.hb.tests.templateFormControl.readyForNested");
fluid.defaults("gpii.hb.tests.templateFormControl.readyForNested", {
    gradeNames:    ["gpii.hb.tests.templateFormControl", "autoInit"],
    hideOnSuccess: false,
    ajaxUrl: "/content/json/success.json",
    components: {
        nested: {
            type:      "gpii.hb.tests.templateFormControl",
            container: ".form-nested-nested",
            createOnEvent: "{readyForNested}.events.onMarkupRendered",
            options: {
                templates: {
                    initial: "form-nested-nested"
                }
            }
        }
    },
    templates: {
        initial: "form-nested-initial"
    }
});