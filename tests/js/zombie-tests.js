// Test all server side modules (including basic template rendering)...
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
var path  = require("path");
fluid.registerNamespace("gpii.express");

var jqUnit  = fluid.require("jqUnit");
var Browser = require("zombie");

require("gpii-express");

require("../../");

// Test content (HTML, JS, templates)
var testDir    = path.resolve(__dirname, "..");
var contentDir = testDir + "/html";
var viewDir    = testDir + "views";

// Dependencies
var bcDir      = path.resolve(__dirname, "../../bower_components");
var modulesDir = path.resolve(__dirname, "../../node_modules");

// Main source to be tested
var srcDir     = path.resolve(__dirname, "../../src");

var testServer = gpii.express({
    config:  {
        "express": {
            "port" :   6994,
            "baseUrl": "http://localhost:6994/",
            "views":   viewDir
        }
    },
    components: {
        inline: {
            type: "gpii.express.hb.inline",
            "options": {
                "path": "/hbs"
            }
        },
        bc: {
            type: "gpii.express.router.static",
            "options": {
                path:    "/bc",
                content: bcDir
            }
        },
        js: {
            type: "gpii.express.router.static",
            "options": {
                path:    "/src",
                content: srcDir
            }
        },
        tests: {
            type: "gpii.express.router.static",
            "options": {
                path:    "/tests",
                content: testDir
            }
        },
        modules: {
            type: "gpii.express.router.static",
            "options": {
                path:    "/modules",
                content: modulesDir
            }
        },
        content: {
            type: "gpii.express.router.static",
            "options": {
                path:    "/content",
                content: contentDir
            }
        },
        handlebars: {
            type: "gpii.express.hb"
        }
    }
});

testServer.runTests = function () {
    var browser = Browser.create();

    jqUnit.module("Integration tests for combined client and server-side template handling...");

    jqUnit.asyncTest("Use zombie.js to run the client-side tests...", function () {
        browser.on("error", function (error) {
            jqUnit.start();
            jqUnit.fail("There should be no errors:" + error);
        });
        browser.visit(testServer.options.config.express.baseUrl + "content/client-tests.html").then(function () {
            jqUnit.start();

            // Zombie provides its own assert library, but we can also just use its jQuery to inspect the DOM.
            var failures = 0;
            browser.window.$(".counts .failed").each(function (index, value) {
                var element = browser.window.$(value);
                failures += parseInt(element.text(), 10);
            });
            jqUnit.assertEquals("There should be no failed tests...", "0", failures);

            var passes = 0;
            browser.window.$(".counts .passed").each(function (index, value) {
                var element = browser.window.$(value);
                passes += parseInt(element.text(), 10);
            });
            jqUnit.assertTrue("There should be passed tests...", passes > 0);

            // Output the qunit summary as part of our results.
            console.log("Browser Test Summary:\n\t" + browser.window.$("#qunit-testresult").text());
        });
    });
};

testServer.runTests();


