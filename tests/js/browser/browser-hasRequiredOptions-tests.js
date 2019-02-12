// TODO: This should be removed as soon as "schema-validated components" are available.
// Test "has required options" grade using `gpii-test-browser`.
//
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("./includes.js");

fluid.registerNamespace("gpii.tests.handlebars.browser.hasRequiredOptions");

gpii.tests.handlebars.browser.hasRequiredOptions.createComponent = function (options) {
    try {
        gpii.tests.handlebars.hasRequiredOptions(options);
        return true;
    }
    catch (error) {
        return false;
    }
};

fluid.defaults("gpii.tests.handlebars.browser.hasRequiredOptions.caseHolder", {
    gradeNames: ["gpii.test.handlebars.browser.caseHolder"],
    rawModules: [{
        name: "Testing the `hasRequiredOptions` client-side grade...",
        tests: [
            {
                name: "Confirm that required options are checked correctly...",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["{testEnvironment}.options.url"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.executeScript",
                        args:     [gpii.tests.handlebars.browser.hasRequiredOptions.createComponent, {}]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertEquals",
                        args:     ["Omitting all options should result in failure.", false, "{arguments}.0"]
                    },
                    {
                        func: "{testEnvironment}.webdriver.executeScript",
                        args:     [gpii.tests.handlebars.browser.hasRequiredOptions.createComponent, { skittles: true }]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertEquals",
                        args:     ["Omitting one option should result in failure.", false, "{arguments}.0"]
                    },
                    {
                        func: "{testEnvironment}.webdriver.executeScript",
                        args:     [gpii.tests.handlebars.browser.hasRequiredOptions.createComponent, { beer: true, skittles: true }]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertEquals",
                        args:     ["Supplying all options should result in success.", true, "{arguments}.0"]
                    }
                ]
            }
        ]
    }]
});

fluid.defaults("gpii.tests.handlebars.browser.hasRequiredOptions.testEnvironment", {
    gradeNames: ["gpii.test.handlebars.browser.environment"],
    "port": 6924,
    "path": "content/tests-hasRequiredOptions.html",
    components: {
        caseHolder: {
            type: "gpii.tests.handlebars.browser.hasRequiredOptions.caseHolder"
        }
    }
});

gpii.test.webdriver.allBrowsers({ baseTestEnvironment: "gpii.tests.handlebars.browser.hasRequiredOptions.testEnvironment"});
