// Test "template aware" client-side components from within a simulated browser.
//
// The client-side template handling requires a server to provide the template content.
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

fluid.registerNamespace("gpii.templates.tests.client.templateFormControl");

gpii.templates.tests.client.templateFormControl.clickAndCheck = function (that, description, url, button, callback) {
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

gpii.templates.tests.client.templateFormControl.runTests = function (that) {

    jqUnit.module("Testing templateFormControl component...");

    that.clickAndCheck("Use Zombie.js to verify the initial form rendering...", null, function (browser) {
            // The client side has already manipulated a bunch of stuff by the time we see it, we're just inspecting the results.
            jqUnit.start();

            // Testing the "replaceWith" DOM-manipulation function
            var body = browser.window.$("body");
            jqUnit.assertTrue("The body should contain rendered content that replaces the original source.", body.text().indexOf("This content should not be visible") === -1);
        }
    );

    that.clickAndCheck("Use Zombie.js to submit a form that receives a successful AJAX response (as JSON)...", "Succeed", function (browser) {
            jqUnit.start();
            var successElement = browser.window.$(".readyForSuccess");
            jqUnit.assertTrue("The component should now contain a 'success' message...", successElement.html().indexOf("This was a triumph") !== -1);

            var successComponent = browser.window.success;
            jqUnit.assertDeepEq("AJAX results should have been appended to the model data as outlined in our rules...", that.options.expected.record, successComponent.model.record);
        }
    );

    that.clickAndCheck("Use Zombie.js to submit a form that GETs a successful AJAX response (as JSON)...", "Get Successful", function (browser) {
            jqUnit.start();
            var successElement = browser.window.$(".readyForGetSuccess");
            jqUnit.assertTrue("The component should now contain a 'success' message...", successElement.html().indexOf("This was a triumph") !== -1);

            var getSuccessComponent = browser.window.getSuccess;
            jqUnit.assertDeepEq("AJAX results should have been appended to the model data as outlined in our rules...", that.options.expected.record, getSuccessComponent.model.record);
        }
    );

    that.clickAndCheck("Use Zombie.js to submit a form that receives a successful AJAX response (as stringified JSON)...", "Stringify Succeed", function (browser) {
            jqUnit.start();
            var successElement = browser.window.$(".readyForStringifySuccess");
            jqUnit.assertTrue("The component should now contain a 'success' message...", successElement.html().indexOf("This was a triumph") !== -1);

            var successStringifyComponent = browser.window.successStringify;
            jqUnit.assertDeepEq("AJAX results should have been appended to the model data as outlined in our rules...", that.options.expected.record, successStringifyComponent.model.record);
        }
    );

    that.clickAndCheck("Use Zombie.js to submit a form that receives a successful AJAX response (as a raw string)...", "String Succeed", function (browser) {
        jqUnit.start();
        var successElement = browser.window.$(".readyForStringSuccess");
        jqUnit.assertTrue("The component should now contain a 'success' message...", successElement.html().indexOf("This was a triumph") !== -1);
    });

    that.clickAndCheck("Use Zombie.js to submit a form that receives an unsuccessful AJAX response (as JSON)...", "Fail", function (browser) {
            jqUnit.start();
            var failureElement = browser.window.$(".readyForFailure");
            jqUnit.assertTrue("The component should now contain a 'fail' message...", failureElement.text().indexOf("Something went wrong") !== -1);
        }
    );

    that.clickAndCheck("Use Zombie.js to submit a form that receives an unsuccessful AJAX response (as stringified JSON)...", "Stringify Fail", function (browser) {
            jqUnit.start();
            var failureElement = browser.window.$(".readyForStringifyFailure");
            jqUnit.assertTrue("The component should now contain a 'fail' message...", failureElement.text().indexOf("Something went wrong") !== -1);
        }
    );

    that.clickAndCheck("Use Zombie.js to submit a form that receives an unsuccessful AJAX response (as a raw string)...", "String Fail", function (browser) {
            jqUnit.start();
            var failureElement = browser.window.$(".readyForStringFailure");
            jqUnit.assertTrue("The component should now contain a 'fail' message...", failureElement.text().indexOf("Something went wrong") !== -1);
        }
    );

    // Zombie lacks the ability to simulate keyboard input, you must roll your own.  See: https://github.com/assaf/zombie/issues/705
    // TODO:  Find a way to simulate keyboard input from within Zombie or migrate to an alternative.
    //jqUnit.asyncTest("Use Zombie.js to submit a form by pressing 'enter' in a text field...", function () {
    //    var browser = Browser.create();
    //    browser.on("error", function (error) {
    //        jqUnit.start();
    //        jqUnit.fail("There should be no errors:" + error);
    //    });
    //    browser.visit(that.options.config.express.baseUrl + "content/tests-templateFormControl.html").then(function () {
    //        browser.window.$(".readyForKeys form").submit();
    //        setTimeout(function () {
    //            jqUnit.start();
    //            var keyedElement = browser.window.$(".readyForKeys");
    //            jqUnit.assertTrue("The component should now contain a 'success' message...", keyedElement.text().indexOf("You have succeeded") !== -1);
    //        }, 5000);
    //    });
    //});
};

gpii.templates.tests.client.harness({
    expressPort : 6995,
    baseUrl:      "http://localhost:6995/",
    contentUrl:   "http://localhost:6995/content/tests-templateFormControl.html",
    expected: {
        record: {
            foo: "bar",
            baz: "qux"
        }
    },
    successStringExpected: { "message": "A success string is still a success." },
    listeners: {
        "{express}.events.onStarted": {
            funcName: "gpii.templates.tests.client.templateFormControl.runTests",
            args:     ["{that}"]
        }
    },
    invokers: {
        clickAndCheck: {
            funcName: "gpii.templates.tests.client.templateFormControl.clickAndCheck",
            // that, description, url, button, callback
            args:     ["{that}", "{arguments}.0", "{that}.options.contentUrl", "{arguments}.1", "{arguments}.2"]
        }
    }
});