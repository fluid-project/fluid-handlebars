// Test all server side modules (including basic template rendering)...
/* eslint-env node */
"use strict";
var fluid = require("infusion");

var jqUnit  = fluid.require("node-jqunit");
var request = require("request");

fluid.require("%fluid-express");
fluid.require("%fluid-handlebars");
require("./lib/sanity.js");

fluid.registerNamespace("fluid.tests.handlebars.server.inline");
fluid.tests.handlebars.server.inline.runTests = function (that) {
    jqUnit.module("Tests for inlining of templates...");

    jqUnit.asyncTest("Confirm that template content is inlined...", function () {
        request.get(that.options.baseUrl + "templates", function (error, response, body) {
            jqUnit.start();

            fluid.test.handlebars.server.isSaneResponse(error, response, body);

            if (body) {
                var data = typeof body === "string" ? JSON.parse(body) : body;
                jqUnit.assertNotNull("There should be templates returned...", data.templates);
                ["layouts", "pages", "partials"].forEach(function (key) {
                    jqUnit.assertTrue("There should be at least some content for each template type...", Object.keys(data[key]).length > 0);
                });
            }
        });
    });

    jqUnit.asyncTest("Confirm that caching works as expected...", function () {
        // Get it once to get the etag.
        request.get({ url: that.options.baseUrl + "templates"}, function (error, response) {
            jqUnit.start();
            jqUnit.assertFalse("There should be no error getting the initial template payload...", error);
            jqUnit.stop();

            // Get it again to confirm that cachine behaves properly.
            var initialEtag = response.headers.etag;
            request.get({ url: that.options.baseUrl + "templates", headers: { "If-None-Match": initialEtag }}, function (error, response, body) {
                jqUnit.start();
                jqUnit.assertFalse("There should be no errors...", error);
                jqUnit.assertEquals("The status code should indicate that the content hasn't changed...", 304, response.statusCode);
                jqUnit.assertEquals("The response should include the same ETag header as before...", initialEtag, response.headers.etag);
                jqUnit.assertEquals("The body should be empty...", "", body);
            });
        });

    });
};

// TODO: Convert to a Fluid IoC test if there are any further problems with test instability.
fluid.express({
    "port" :   6914,
    "baseUrl": "http://localhost:6914/",
    json: { foo: "bar", baz: "quux", qux: "quux" },
    listeners: {
        "onStarted.runTests": {
            funcName: "fluid.tests.handlebars.server.inline.runTests",
            args:     ["{that}"]
        }
    },
    components: {
        inline: {
            type: "fluid.handlebars.inlineTemplateBundlingMiddleware",
            options: {
                templateDirs: {
                    primary: "%fluid-handlebars/tests/templates/primary",
                    secondary: {
                        path: "%fluid-handlebars/tests/templates/secondary",
                        priority: "before:primary"
                    }
                }
            }
        }
    }
});
