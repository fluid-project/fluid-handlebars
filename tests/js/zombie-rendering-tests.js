// Test client-side rendering from within a simulated browser.
//
// The client-side template handling requires a server to provide the template content.
"use strict";
var fluid = fluid || require("infusion");
fluid.setLogging(true);

var gpii  = fluid.registerNamespace("gpii");

var jqUnit  = fluid.require("jqUnit");
var Browser = require("zombie");

require("./zombie-test-harness");

fluid.registerNamespace("gpii.templates.hb.tests.client.render");

// All tests should look for rendered content as well as variables, jsonify content, and markdown content
gpii.templates.hb.tests.client.render.commonTests = function (that, element, $) {
    jqUnit.assertNotNull("The results should not be null.", element.html());

    var mdRegexp = /<p><em>this works<\/em><\/p>/i;
    jqUnit.assertNotNull("The results should contain transformed markdown.", element.html().match(mdRegexp));

    var variableRegexp = new RegExp(that.options.expected.myvar);
    jqUnit.assertNotNull("The results should contain variable data.", element.html().match(variableRegexp));

    var jsonString = element.find(".jsonify").html();
    var outputData = JSON.parse(jsonString);

    jqUnit.assertDeepEq("The output should match the model...", that.options.expected.json, outputData);

    // Tests for the "equals" helper
    var equalCandidates = element.find(".equal");
    for (var a = 0; a < equalCandidates.length; a++) {
        var equalCandidate = equalCandidates[a];
        jqUnit.assertEquals("All 'equal' comparisons should end up displaying 'true'.", "true", $(equalCandidate).text());
    }

    var unequalCandidates = element.find(".unequal");
    for (var b = 0; b < unequalCandidates.length; b++) {
        var unequalCandidate = unequalCandidates[b];
        jqUnit.assertEquals("All 'unequal' comparisons should end up displaying 'false'.", "false", $(unequalCandidate).text());
    }
};

gpii.templates.hb.tests.client.render.runTests = function (that) {
    var browser = Browser.create();

    jqUnit.module("Integration tests for combined client and server-side template handling...");

    jqUnit.asyncTest("Use zombie.js to test client-side template output...", function () {
        browser.on("error", function (error) {
            jqUnit.start();
            jqUnit.fail("There should be no errors:" + error);
        });
        browser.visit(that.options.config.express.baseUrl + "content/tests-rendering.html").then(function () {
            // The client side has already manipulated a bunch of stuff by the time we see it, we're just inspecting the results.
            jqUnit.start();

            // Testing the "after" DOM-manipulation function
            var afterElement = browser.window.$(".viewport-after");
            jqUnit.assertTrue("An element with content inserted after it should not have changed.", "original content", afterElement.text());
            var nextElement = afterElement.next();
            jqUnit.assertTrue("Content should be inserted after the original element.", nextElement.html().indexOf("from the partial") !== -1);
            gpii.templates.hb.tests.client.render.commonTests(that, nextElement, browser.window.$);

            // Testing the "append" DOM-manipulation function
            var appendElement = browser.window.$(".viewport-append");
            var appendRegexp = /^original content/;
            jqUnit.assertNotNull("The original text should be at the beginning of the results", appendElement.html().match(appendRegexp));
            gpii.templates.hb.tests.client.render.commonTests(that, appendElement, browser.window.$);

            // Testing the "before" DOM-manipulation function
            var beforeElement = browser.window.$(".viewport-before");
            jqUnit.assertEquals("An element with content inserted before it should not have changed.", "original content", beforeElement.text());
            var elementInsertedBefore = beforeElement.prev();
            gpii.templates.hb.tests.client.render.commonTests(that, elementInsertedBefore, browser.window.$);

            // Testing the "html" DOM-manipulation function
            var htmlElement = browser.window.$(".viewport-html");
            jqUnit.assertTrue("An element updated with the html method should not contain the original text", htmlElement.text().indexOf("original content") === -1);
            gpii.templates.hb.tests.client.render.commonTests(that, htmlElement, browser.window.$);

            // Testing the "prepend" DOM-manipulation function
            var prependElement = browser.window.$(".viewport-prepend");
            var prependRegexp = /original content$/;
            jqUnit.assertNotNull("The original text should be at the beginning of the results.", prependElement.text().match(prependRegexp));
            gpii.templates.hb.tests.client.render.commonTests(that, prependElement, browser.window.$);

            // Testing the "replaceWith" DOM-manipulation function
            var replaceWithElement = browser.window.$(".viewport-html");
            jqUnit.assertTrue("An element updated with the replaceWith method should not contain the original text", replaceWithElement.text().indexOf("original content") === -1);
            gpii.templates.hb.tests.client.render.commonTests(that, replaceWithElement, browser.window.$);
        });
    });
};

fluid.defaults("gpii.templates.hb.tests.client.render", {
    gradeNames: ["gpii.templates.hb.tests.client.harness", "autoInit"],
    "expressPort" :   6994,
    "baseUrl":        "http://localhost:6994/",
    // This is "expected" data that must match the model data found in client-tests.js
    expected: {
        myvar:    "modelvariable",
        markdown: "*this works*",
        json:     { foo: "bar", baz: "quux", qux: "quux" }
    },
    listeners: {
        "{express}.events.onStarted": {
            funcName: "gpii.templates.hb.tests.client.render.runTests",
            args:     ["{that}"]
        }
    }
});

gpii.templates.hb.tests.client.render();