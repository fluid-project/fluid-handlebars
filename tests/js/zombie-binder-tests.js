"use strict";
// Test "binder" components using Zombie and filesystem content.
//
// Zombie provides two means of interrogating globals within the browser, namely:
//
// 1. `browser.assert.global(name, expected, message)`, which tests the global with `name` to confirm that it matches
//     `expected`, and throws `message` if it does not.
//
// 2. `browser.window[fieldName]` provides direct access to the global variable `fieldName`.
//
// We will use the latter in these tests and using `jqUnit` assertions.  The page itself will use jQuery to manipulate
// all controls, Zombie is only inspecting the final results.
//
// TODO:  Revisit opening a standalone file with Zombie once we have a better pattern for using it with server content.
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");

fluid.setLogging(true);

var Browser = require("zombie");
var path    = require("path");
var jqUnit = require("jqUnit");

fluid.registerNamespace("gpii.tests.binder");
gpii.tests.binder.runTests = function (that) {
    jqUnit.module("Testing binder separately from template handling...");
    fluid.each(that.options.componentNames, function (componentName) {
        jqUnit.asyncTest("Testing component '" + componentName + "'...", function () {
            var browser = Browser.create();
            browser.on("error", function (error) {
                jqUnit.start();
                jqUnit.fail("There should be no errors:" + error);
            });
            browser.visit(that.options.url, function () {
                jqUnit.start();
                var component = browser.window[componentName];
                jqUnit.assertDeepEq("The initial model of component '" + componentName + "' should match the expected results.", that.options.expectedOnInit, component.model);

                var formElementToUpdate = component.locate("updateFromMarkup");
                // Zombie's `fill(selector, value)` method only works with particular types of elements, so we have to use a range of approaches for other types of form elements.
                var tag = formElementToUpdate.prop("tagName").toLowerCase();
                var type = formElementToUpdate.prop("type");
                if (tag === "textarea" || (tag === "input" && type === "text")) {
                    browser.fill(formElementToUpdate.selector, "updated using form controls");
                }
                // Zombie does provide to click on a radio button using only the button's value or text, but we have a number with the same value and text and want to target things more cleanly.
                else if (tag === "input" && type === "radio") {
                    browser.choose(formElementToUpdate.selector + "[value='updated using form controls']");
                }
                // Thankfully, Zombie at least allows choosing a select option matching a desired value.
                else if (tag === "select") {
                    browser.select(formElementToUpdate.selector, "updated using form controls");
                }
                jqUnit.assertEquals("A change to the form controls should result in an update to the model", "updated using form controls", component.model.updateFromMarkup);

                component.applier.change("updateFromModel", "updated using applier");
                var updatedFormElement = component.locate("updateFromModel");
                var clientSideFluid = browser.window.fluid;
                var clientSideValue = clientSideFluid.value(updatedFormElement);
                jqUnit.assertEquals("A change to the model should result in an update to the form element", "updated using applier", clientSideValue);
            });
        });
    });
};

var testFile = "file://" + path.resolve(__dirname, "../html/tests-binder.html");
fluid.defaults("gpii.tests.binder", {
    gradeNames: ["fluid.eventedComponent", "autoInit"],
    url:        testFile,
    componentNames: ["long", "short", "array", "textarea", "select", "radio"],
    expectedOnInit: {
        initFromModel:    "initialized from model",
        initFromMarkup:   "initialized from markup"
    },
    listeners: {
        "onCreate.runTests": {
            funcName: "gpii.tests.binder.runTests",
            args:     ["{that}"]
        }
    }
});


gpii.tests.binder();
