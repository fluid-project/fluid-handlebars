// Test `initBlock` server-side Handlebars helper.
//
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("./includes.js");

fluid.registerNamespace("gpii.tests.handlebars.browser.initBlock");
gpii.tests.handlebars.browser.initBlock.selectorContains = function (selector, subString) {
    /* globals document */
    var mainString = document.querySelector(selector).innerHTML;
    return mainString.indexOf(subString) !== -1;
};

fluid.defaults("gpii.tests.handlebars.browser.initBlock.caseHolder", {
    gradeNames: ["gpii.test.handlebars.browser.caseHolder.base"],
    rawModules: [{
        name: "Testing `initBlock` helper...",
        tests: [
            {
                name: "Confirm the page was rendered and that the initBlock component was created correctly...",
                sequence: [
                    {
                        func: "{gpii.test.handlebars.browser.environment}.webdriver.get",
                        args: ["{gpii.test.handlebars.browser.environment}.options.url"]
                    },
                    {
                        event:    "{gpii.test.handlebars.browser.environment}.webdriver.events.onGetComplete",
                        listener: "{gpii.test.handlebars.browser.environment}.webdriver.wait",
                        args:     [gpii.webdriver.until.elementLocated({ css: ".initBlock-viewport"})]
                    },
                    {
                        event:    "{gpii.test.handlebars.browser.environment}.webdriver.events.onWaitComplete",
                        listener: "{gpii.test.handlebars.browser.environment}.webdriver.executeScript",
                        args:     [gpii.test.webdriver.invokeGlobal, "fluid.getGlobalValue", "pageComponent.requireRenderer.pageComponent.model"] // functionPath, fnArgs, environment
                    },
                    {
                        event:    "{gpii.test.handlebars.browser.environment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertDeepEq",
                        args:     ["The component model should include query, parameter, default, and dispatcher data...", "{gpii.test.handlebars.browser.environment}.options.expected", "{arguments}.0"]
                    },
                    {
                        func: "{gpii.test.handlebars.browser.environment}.webdriver.executeScript",
                        args: [gpii.tests.handlebars.browser.initBlock.selectorContains, "body", "This content should not be visible"]
                    },
                    {
                        event:    "{gpii.test.handlebars.browser.environment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertFalse",
                        args:     ["The original body content should have been replaced...", "{arguments}.0"]
                    },
                    {
                        func: "{gpii.test.handlebars.browser.environment}.webdriver.executeScript",
                        args: [gpii.tests.handlebars.browser.initBlock.selectorContains, "body", "coming from the page"]
                    },
                    {
                        event:    "{gpii.test.handlebars.browser.environment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertTrue",
                        args:     ["The body should contain template output...", "{arguments}.0"]
                    }
                ]
            }
        ]
    }]
});

fluid.defaults("gpii.tests.handlebars.browser.initBlock.testEnvironment", {
    gradeNames: ["gpii.test.handlebars.browser.environment"],
    port: 6995,
    path: "dispatcher/initblock?myvar=bar",
    expected: {
        "hasDataFromGrade": true,
        "req": {
            "query": {
                "myvar": "bar"
            },
            "params": {
                "template": "initblock"
            }
        },
        "json": {
            "foo": "bar",
            "baz": "quux",
            "qux": "quux"
        },
        "myvar": "modelvariable",
        "markdown": "*this works*"
    },
    components: {
        caseHolder: {
            type: "gpii.tests.handlebars.browser.initBlock.caseHolder"
        }
    }
});

gpii.test.webdriver.allBrowsers({ baseTestEnvironment: "gpii.tests.handlebars.browser.initBlock.testEnvironment"});
