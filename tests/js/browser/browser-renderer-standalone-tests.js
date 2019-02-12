// Test client-side rendering using `gpii-test-browser` (Atom Electron and Chromium).
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("./includes.js");

// Client side "evaluate" function to render a payload and return the result
fluid.registerNamespace("gpii.tests.handlebars.browser.renderer.standalone");
gpii.tests.handlebars.browser.renderer.standalone.render = function (templateKey, context) {
    var renderer = gpii.tests.handlebars.renderer.standalone();
    return renderer.render(templateKey, context);
};

fluid.defaults("gpii.tests.handlebars.browser.renderer.standalone.caseHolder", {
    gradeNames: ["gpii.test.handlebars.browser.caseHolder.base"],
    rawModules: [{
        name: "Testing standalone renderer component...",
        tests: [
            {
                name: "Confirm that the client-side renderer can render markdown...",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["{testEnvironment}.options.url"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.executeScript",
                        args:     [gpii.tests.handlebars.browser.renderer.standalone.render, "md", { payload: "[unified listing](http://ul.gpii.net/)" }]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertEquals",
                        args:     ["We should have received rendered markup...", "<p><a href=\"http://ul.gpii.net/\">unified listing</a></p>\n", "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Confirm that the client-side partials work...",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["{testEnvironment}.options.url"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.executeScript",
                        args:     [gpii.tests.handlebars.browser.renderer.standalone.render, "partial"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertEquals",
                        args:     ["We should have received partial content...", "This is content coming from the partial.", "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Confirm that the JSONify helper works...",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["{testEnvironment}.options.url"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.executeScript",
                        args:     [gpii.tests.handlebars.browser.renderer.standalone.render, "jsonify", { payload: { foo: "bar" } }]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertDeepEq",
                        args:     ["We should have received stringified JSON content...", { foo: "bar" }, "@expand:JSON.parse({arguments}.0)"]
                    }
                ]
            },
            {
                name: "Confirm that the equals helper works...",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["{testEnvironment}.options.url"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.executeScript",
                        args:     [gpii.tests.handlebars.browser.renderer.standalone.render, "equals", { payload: "good" }]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertEquals",
                        args:     ["We should have hit the 'equals' block...", "equals", "{arguments}.0"]
                    },
                    {
                        func: "{testEnvironment}.webdriver.executeScript",
                        args: [gpii.tests.handlebars.browser.renderer.standalone.render, "equals", { payload: "bad"} ]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "jqUnit.assertEquals",
                        args:     ["We should have hit the 'equals' block...", "not equals", "{arguments}.0"]
                    }
                ]
            }
        ]
    }]
});

fluid.defaults("gpii.tests.handlebars.browser.renderer.standalone.testEnvironment", {
    gradeNames: ["gpii.test.handlebars.browser.environment"],
    path: "%gpii-handlebars/tests/static/tests-renderer-standalone.html",
    url: "@expand:gpii.test.webdriver.resolveFileUrl({that}.options.path)",
    components: {
        caseHolder: {
            type: "gpii.tests.handlebars.browser.renderer.standalone.caseHolder"
        }
    }
});

gpii.test.webdriver.allBrowsers({ baseTestEnvironment: "gpii.tests.handlebars.browser.renderer.standalone.testEnvironment"});
