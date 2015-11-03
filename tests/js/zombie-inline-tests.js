// Test "inline" router from the other side, ensuring that inheritance, etc. works correctly.
"use strict";
var fluid = fluid || require("infusion");

var gpii  = fluid.registerNamespace("gpii");

var jqUnit  = fluid.require("jqUnit");
var Browser = require("zombie");

require("gpii-express");
require("../../");
require("./zombie-test-harness");

fluid.registerNamespace("gpii.templates.tests.client.inline");

gpii.templates.tests.client.inline.runTests = function (that) {

    jqUnit.module("Testing inline router from the client side...");

    jqUnit.asyncTest("Use Zombie.js to verify that the renderer has the correct template content...", function () {
        var browser = Browser.create();
        browser.on("error", function (error) {
            jqUnit.start();
            jqUnit.fail("There should be no errors:" + error);
        });
        browser.visit(that.options.config.express.baseUrl + "content/tests-templateAware.html").then(function () {
            // The client side has already manipulated a bunch of stuff by the time we see it, we're just inspecting the results.
            jqUnit.start();

            var component = browser.window.templateAware;
            jqUnit.assertNotNull("There should be a global variable for the client-side component...", component);

            jqUnit.assertNotNull("The client side component should have a renderer...", component.renderer);

            var templates = component.renderer.templates;
            jqUnit.assertNotNull("The renderer should have templates...", templates);

            // There should be layouts, pages, and partials
            fluid.each(["layouts", "pages", "partials"], function (key) {
                jqUnit.assertTrue("There should be " + key + " content...", templates[key] && Object.keys(templates[key]).length > 0);
            });

            // Content for `pages/overriden.handlebars` and `partials/overriden-partial.handlebars` should come
            // from the primary view directory
            jqUnit.assertTrue("The overriden page template should come from the primary view directory...", templates.pages.overridden.indexOf("primary") !== -1);
            jqUnit.assertTrue("The overriden partial should come from the primary view directory...", templates.partials["overridden-partial"].indexOf("primary") !== -1);

            // Content for `pages/secondary.handlebars` and `partials/secondary-partial.handlebars` should be found
            jqUnit.assertTrue("A page template found in the secondary view directory should exist...", templates.pages.secondary.length > 0);
            jqUnit.assertTrue("A partial found in the secondary view directory should exist...", templates.partials["secondary-partial"].length > 0);
        });
    });
};

var inlineComponent = gpii.templates.tests.client.harness({
    "expressPort" :   6595,
    "baseUrl":        "http://localhost:6595/",
    listeners: {
        "{express}.events.onStarted": {
            funcName: "gpii.templates.tests.client.inline.runTests",
            args:     ["{that}"]
        }
    }
});
module.exports = inlineComponent.afterDestroyPromise;
