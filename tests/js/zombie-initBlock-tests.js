// Test `initBlock` server-side Handlebars helper.
//
// TODO:  Sit down with Antranig to make Zombie components, so that these tests can use the Kettle test infrastructure.
"use strict";
var fluid = fluid || require("infusion");
//fluid.setLogging(true);

var gpii  = fluid.registerNamespace("gpii");

var jqUnit  = fluid.require("jqUnit");
var Browser = require("zombie");

require("gpii-express");

require("../../");
require("./zombie-test-harness");
require("./test-router-error");

fluid.registerNamespace("gpii.templates.tests.client.initBlock");

gpii.templates.tests.client.initBlock.clickAndCheck = function (that, description, url, button, callback) {
    jqUnit.asyncTest(description, function () {
            var browser = Browser.create();
            browser.on("error", function (error) {
                jqUnit.start();
                jqUnit.fail("There should be no errors:" + error);
                jqUnit.stop();
            });
            browser.visit(url, function () {
                if (button) {
                    browser.pressButton(button, function () {
                        callback(browser);
                    });
                }
                else {
                    callback(browser);
                }
            });
        }
    );
};

gpii.templates.tests.client.initBlock.runTests = function (that) {

    jqUnit.module("Testing initBlock component...");

    that.clickAndCheck("Use Zombie.js to verify the initial form rendering...", null, function (browser) {
            // The client side has already manipulated a bunch of stuff by the time we see it, we're just inspecting the results.
            jqUnit.start();

            // Testing the "replaceWith" DOM-manipulation function
            var body = browser.window.$("body");
            jqUnit.assertTrue("The body should contain rendered content that replaces the original source.", body.text().indexOf("This content should not be visible") === -1);

            jqUnit.assertTrue("There should be page content...", body.text().indexOf("coming from the page") !== -1);

            var pageComponent = browser.window.pageComponent;
            var deepComponent = pageComponent.requireRenderer.pageComponent;
            jqUnit.assertDeepEq("The component model should include query, parameter, default, and dispatcher data...", that.options.expected, deepComponent.model);
        }
    );
};

gpii.templates.tests.client.harness({
    expressPort : 6995,
    baseUrl:    "http://localhost:6995/",
    contentUrl: "http://localhost:6995/dispatcher/initblock?myvar=bar",
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
    listeners: {
        "{express}.events.onStarted": {
            funcName: "gpii.templates.tests.client.initBlock.runTests",
            args:     ["{that}"]
        }
    },
    invokers: {
        clickAndCheck: {
            funcName: "gpii.templates.tests.client.initBlock.clickAndCheck",
            // that, description, url, button, callback
            args:     ["{that}", "{arguments}.0", "{that}.options.contentUrl", "{arguments}.1", "{arguments}.2"]
        }
    }
});