// Test "template aware" client-side components using `gpii-test-browser`.
//
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("./includes.js");

fluid.registerNamespace("gpii.tests.handlebars.client.templateFormControl");

fluid.defaults("gpii.tests.handlebars.browser.templateFormControl.caseHolder", {
    gradeNames: ["gpii.test.handlebars.browser.caseHolder.base"],
    rawModules: [{
        name: "Testing the `templateFormControl` client-side grade...",
        tests: [
            {
                name: "Confirm that the initial form is rendered...",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["{testEnvironment}.options.url"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForSuccess"})]
                    },
                    {
                        event: "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args: [{ css: "body" }]
                    },
                    {
                        event: "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "gpii.test.handlebars.elementMatches",
                        args: ["The body should contain rendered content that replaces the original source...", "{arguments}.0", "getText", "This content should not be visible", true] // message, element, elementFn, pattern, invert
                    }
                ]
            },
            {
                name: "Submit a form that receives a successful AJAX response (as JSON)...",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["{testEnvironment}.options.url"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForSuccess"})]
                    },
                    // We must explicitly set the initial focus, as Firefox focuses on the location bar by default.
                    {
                        event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args:     [{ css: ".initial-focus-here"}]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "{testEnvironment}.webdriver.actionsHelper",
                        args:     [[{fn: "click", args: ["{arguments}.0"]}, {fn: "sendKeys", args: [gpii.webdriver.Key.TAB, gpii.webdriver.Key.ENTER]}]]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForSuccess .templateFormControl-success"})]
                    },
                    {
                        event: "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args: [{ css: ".readyForSuccess .templateFormControl-success" }]
                    },
                    {
                        event: "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "gpii.test.handlebars.elementMatches",
                        args: ["A success message should now be displayed...", "{arguments}.0", "getText", "This was a triumph"] // message, element, elementFn, pattern, invert
                    },
                    {
                        func: "{testEnvironment}.webdriver.executeScript",
                        args: [gpii.test.webdriver.invokeGlobal, "fluid.getGlobalValue", "success.model.record"] // functionPath, fnArgs, environment
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertDeepEq",
                        args:     ["AJAX results should have been appended to the model data as outlined in our rules...", "{testEnvironment}.options.expected.record", "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Submit a form that receives a successful AJAX response (as stringified JSON)...",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["{testEnvironment}.options.url"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForStringifySuccess"})]
                    },
                    // We must explicitly set the initial focus, as Firefox focuses on the location bar by default.
                    {
                        event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args:     [{ css: ".initial-focus-here"}]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "{testEnvironment}.webdriver.actionsHelper",
                        args:     [[{fn: "click", args: ["{arguments}.0"]}, {fn: "sendKeys", args: [fluid.generate(3, gpii.webdriver.Key.TAB).concat(gpii.webdriver.Key.ENTER)]}]]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForStringifySuccess .templateFormControl-success"})]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args:     [{ css: ".readyForStringifySuccess .templateFormControl-success" }]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "gpii.test.handlebars.elementMatches",
                        args:     ["A success message should now be displayed...", "{arguments}.0", "getText", "This was a triumph"] // message, element, elementFn, pattern, invert
                    },
                    {
                        func: "{testEnvironment}.webdriver.executeScript",
                        args: [gpii.test.webdriver.invokeGlobal, "fluid.getGlobalValue", "successStringify.model.record"] // functionPath, fnArgs, environment
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertDeepEq",
                        args:     ["AJAX results should have been appended to the model data as outlined in our rules...", "{testEnvironment}.options.expected.record", "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Submit a form that receives a successful AJAX response (as a raw string)...",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["{testEnvironment}.options.url"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForStringSuccess"})]
                    },
                    // We must explicitly set the initial focus, as Firefox focuses on the location bar by default.
                    {
                        event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args:     [{ css: ".initial-focus-here"}]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "{testEnvironment}.webdriver.actionsHelper",
                        args:     [[{fn: "click", args: ["{arguments}.0"]}, {fn: "sendKeys", args: [fluid.generate(4, gpii.webdriver.Key.TAB).concat(gpii.webdriver.Key.ENTER)]}]]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForStringSuccess .templateFormControl-success"})]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args:     [{ css: ".readyForStringSuccess .templateFormControl-success" }]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "gpii.test.handlebars.elementMatches",
                        args:     ["A success message should now be displayed...", "{arguments}.0", "getText", "This was a triumph"] // message, element, elementFn, pattern, invert
                    },
                    {
                        func: "{testEnvironment}.webdriver.executeScript",
                        args: [gpii.test.webdriver.invokeGlobal, "fluid.getGlobalValue", "successString.model.successMessage"] // functionPath, fnArgs, environment
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertEquals",
                        args:     ["We should have received a success string as expected...", "{testEnvironment}.options.expected.successString", "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Submit a form that receives an unsuccessful AJAX response (as JSON)...",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["{testEnvironment}.options.url"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForFailure"})]
                    },
                    // We must explicitly set the initial focus, as Firefox focuses on the location bar by default.
                    {
                        event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args:     [{ css: ".initial-focus-here"}]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "{testEnvironment}.webdriver.actionsHelper",
                        args:     [[{fn: "click", args: ["{arguments}.0"]}, {fn: "sendKeys", args: [fluid.generate(5, gpii.webdriver.Key.TAB).concat(gpii.webdriver.Key.ENTER)]}]]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForFailure .templateFormControl-error"})]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args:     [{ css: ".readyForFailure .templateFormControl-error" }]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "gpii.test.handlebars.elementMatches",
                        args:     ["An error message should be displayed...", "{arguments}.0", "getText", "Something went wrong"] // message, element, elementFn, pattern, invert
                    },
                    {
                        func: "{testEnvironment}.webdriver.executeScript",
                        args: [gpii.test.webdriver.invokeGlobal, "fluid.getGlobalValue", "failure.model.errorMessage"] // functionPath, fnArgs, environment
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertEquals",
                        args:     ["The model should now contain the error message...", "{testEnvironment}.options.expected.failureString", "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Submit a form that receives an unsuccessful AJAX response (as stringified JSON)...",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["{testEnvironment}.options.url"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForStringifyFailure"})]
                    },
                    // We must explicitly set the initial focus, as Firefox focuses on the location bar by default.
                    {
                        event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args:     [{ css: ".initial-focus-here"}]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "{testEnvironment}.webdriver.actionsHelper",
                        args:     [[{fn: "click", args: ["{arguments}.0"]}, {fn: "sendKeys", args: [fluid.generate(6, gpii.webdriver.Key.TAB).concat(gpii.webdriver.Key.ENTER)]}]]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForStringifyFailure .templateFormControl-error"})]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args:     [{ css: ".readyForStringifyFailure .templateFormControl-error" }]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "gpii.test.handlebars.elementMatches",
                        args:     ["An error message should be displayed...", "{arguments}.0", "getText", "Something went wrong"] // message, element, elementFn, pattern, invert
                    },
                    {
                        func: "{testEnvironment}.webdriver.executeScript",
                        args: [gpii.test.webdriver.invokeGlobal, "fluid.getGlobalValue", "stringifyFailure.model.errorMessage"] // functionPath, fnArgs, environment
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertEquals",
                        args:     ["The model should now contain the error message...", "{testEnvironment}.options.expected.failureString", "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Submit a form that receives an unsuccessful AJAX response (as a String)...",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["{testEnvironment}.options.url"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForStringFailure"})]
                    },
                    // We must explicitly set the initial focus, as Firefox focuses on the location bar by default.
                    {
                        event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args:     [{ css: ".initial-focus-here"}]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "{testEnvironment}.webdriver.actionsHelper",
                        args:     [[{fn: "click", args: ["{arguments}.0"]}, {fn: "sendKeys", args: [fluid.generate(7, gpii.webdriver.Key.TAB).concat(gpii.webdriver.Key.ENTER)]}]]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".readyForStringFailure .templateFormControl-error"})]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args:     [{ css: ".readyForStringFailure .templateFormControl-error" }]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "gpii.test.handlebars.elementMatches",
                        args:     ["An error message should be displayed...", "{arguments}.0", "getText", "Something went wrong"] // message, element, elementFn, pattern, invert
                    },
                    {
                        func: "{testEnvironment}.webdriver.executeScript",
                        args: [gpii.test.webdriver.invokeGlobal, "fluid.getGlobalValue", "stringFailure.model.errorMessage"] // functionPath, fnArgs, environment
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertEquals",
                        args:     ["The model should now contain the error message...", "{testEnvironment}.options.expected.failureResponseText", "{arguments}.0"]
                    }
                ]
            }
        ]
    }]
});

fluid.defaults("gpii.tests.handlebars.browser.templateFormControl.testEnvironment", {
    gradeNames: ["gpii.test.handlebars.browser.environment"],
    port: 6993,
    path: "content/tests-templateFormControl.html",
    waitAfterLoad: 150,
    expected: {
        record: {
            foo: "bar",
            baz: "qux"
        },
        successString: "A success string is still a success.",
        failureString: "The response was not successful...",
        failureResponseText: "There was a problem.  I'm telling you about it with a string response, hopefully this doesn't cause another problem."
    },
    components: {
        caseHolder: {
            type: "gpii.tests.handlebars.browser.templateFormControl.caseHolder"
        }
    }
});

gpii.test.webdriver.allBrowsers({ baseTestEnvironment: "gpii.tests.handlebars.browser.templateFormControl.testEnvironment"});
