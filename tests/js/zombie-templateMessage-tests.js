"use strict";
// Test "templateMessage" components using Zombie and filesystem content.
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");

fluid.setLogging(true);

var Browser = require("zombie");
var path    = require("path");
var jqUnit = require("jqUnit");

fluid.registerNamespace("gpii.tests.templateMessage");
gpii.tests.templateMessage.runTests = function (that) {
    jqUnit.module("Testing template message components (non-networked renderer)...");
    jqUnit.asyncTest("Testing template message components...", function () {
        var browser = Browser.create();
        browser.on("error", function (error) {
            jqUnit.start();
            jqUnit.fail("There should be no errors:" + error);
        });

        browser.visit(that.options.url, function () {
            jqUnit.start();

            var body = browser.window.$("body");
            jqUnit.assertTrue("The placeholder text should no longer be present...", body.text().indexOf(that.options.notExpected) === -1);
            jqUnit.assertTrue("A component with initial model data should display as expected...", body.text().indexOf(that.options.expected.initialized) !== -1);
            jqUnit.assertTrue("A component with updated model data should display as expected...", body.text().indexOf(that.options.expected.updated) !== -1);
        });
    });
};

var testFile = "file://" + path.resolve(__dirname, "../html/tests-templateMessage.html");
fluid.defaults("gpii.tests.templateMessage", {
    gradeNames: ["fluid.eventedComponent", "autoInit"],
    url:        testFile,
    notExpected: "should not be visible",
    expected: {
        initialized: "born with silver model data in my mouth",
        updated:     "some have data thrust upon them"
    },
    listeners: {
        "onCreate.runTests": {
            funcName: "gpii.tests.templateMessage.runTests",
            args:     ["{that}"]
        }
    }
});


gpii.tests.templateMessage();
