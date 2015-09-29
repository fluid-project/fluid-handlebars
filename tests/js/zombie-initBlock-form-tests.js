// Test `initBlock` server-side Handlebars helper with a distributed renderer (using a templateFormControl).
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

fluid.registerNamespace("gpii.templates.tests.client.initBlock.form");

gpii.templates.tests.client.initBlock.form.clickAndCheck = function (that, description, url, button, callback) {
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

gpii.templates.tests.client.initBlock.form.runTests = function (that) {
    jqUnit.module("Testing initBlock form component with nested renderer...");

    that.clickAndCheck("Use Zombie.js to verify the initial form rendering...", "Succeed", function (browser) {
            // The client side has already manipulated a bunch of stuff by the time we see it, we're just inspecting the results.
            jqUnit.start();

            // Testing the "replaceWith" DOM-manipulation function
            var body = browser.window.$("body");
            jqUnit.assertTrue("The body should contain rendered content that replaces the original source.", body.text().indexOf("This content should not be visible") === -1);

            jqUnit.assertTrue("The body should contain 'success' content.", body.text().indexOf("This was a triumph") !== -1);
        }
    );
};

var initBlockComponent = gpii.templates.tests.client.harness({
    expressPort : 6995,
    baseUrl:    "http://localhost:6995/",
    contentUrl: "http://localhost:6995/dispatcher/initblock-form",
    listeners: {
        "{express}.events.onStarted": {
            funcName: "gpii.templates.tests.client.initBlock.form.runTests",
            args:     ["{that}"]
        }
    },
    invokers: {
        clickAndCheck: {
            funcName: "gpii.templates.tests.client.initBlock.form.clickAndCheck",
            // that, description, url, button, callback
            args:     ["{that}", "{arguments}.0", "{that}.options.contentUrl", "{arguments}.1", "{arguments}.2"]
        }
    }
});

module.exports = initBlockComponent.afterDestroyPromise;
