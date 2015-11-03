// Test all server side modules (including basic template rendering)...
"use strict";
var fluid = fluid || require("infusion");
fluid.setLogging(true);

var gpii = fluid.registerNamespace("gpii");

var path = require("path");

var jqUnit  = fluid.require("jqUnit");
var request = require("request");

require("gpii-express");
require("../../");

var viewDirs = [
    path.resolve(__dirname, "../templates/primary"),
    path.resolve(__dirname, "../templates/secondary")
];

fluid.registerNamespace("gpii.templates.tests.server");
gpii.templates.tests.server.bodyMatches = function (message, body, pattern, shouldNotMatch) {
    var matches = body.match(pattern);
    if (shouldNotMatch) {
        jqUnit.assertNull(message, matches);
    }
    else {
        jqUnit.assertNotNull(message, matches);
    }
};

gpii.templates.tests.server.isSaneResponse = function (jqUnit, error, response, body) {
    jqUnit.assertNull("There should be no errors.", error);

    jqUnit.assertEquals("The response should have a reasonable status code", 200, response.statusCode);
    if (response.statusCode !== 200) {
        console.log(JSON.stringify(body, null, 2));
    }

    jqUnit.assertNotNull("There should be a body.", body);
};

gpii.templates.tests.server.runTests = function (that) {
    jqUnit.module("Tests for inlining of templates...");

    jqUnit.asyncTest("Confirm that template content is inlined...", function () {
        request.get(that.options.config.express.baseUrl + "inline", function (error, response, body) {
            jqUnit.start();

            gpii.templates.tests.server.isSaneResponse(jqUnit, error, response, body);

            if (body) {
                var data = typeof body === "string" ? JSON.parse(body) : body;
                jqUnit.assertNotNull("There should be templates returned...", data.templates);
                ["layouts", "pages", "partials"].forEach(function (key) {
                    jqUnit.assertTrue("There should be at least some content for each template type...", Object.keys(data.templates[key]).length > 0);
                });
            }
        });
    });

    jqUnit.module("Tests for dispatcher...");

    // Test the following variations:
    //
    //   1. The default home page with the default layout
    //   2. A custom page with matching layout
    //   3. A custom page with no matching layout
    //
    //  All variations should test partials and variables
    var pages = ["custom", "custom-no-matching-layout", ""];

    pages.forEach(function (page) {
        jqUnit.asyncTest("Test template handling dispatcher for page '" + page + "' ...", function () {
            request.get(that.options.config.express.baseUrl + "dispatcher/" + page + "?myvar=queryvariable", function (error, response, body) {
                jqUnit.start();

                gpii.templates.tests.server.isSaneResponse(jqUnit, error, response, body);

                gpii.templates.tests.server.bodyMatches("There should be layout content in the body...", body, /from the layout/);
                gpii.templates.tests.server.bodyMatches("There should be page content in the body...", body, /from the page/);
                gpii.templates.tests.server.bodyMatches("There should be partial content in the body...", body, /from the partial/);
                gpii.templates.tests.server.bodyMatches("The results should contain transformed markdown.", body, /<p><em>this works<\/em><\/p>/i);
                gpii.templates.tests.server.bodyMatches("There should be model variable content in the body...", body, /modelvariable/);
                gpii.templates.tests.server.bodyMatches("There should be query variable content in the body...", body, /queryvariable/);

                // Tests for the "equals" helper.  We don't use the standard function because we want to inspect the individual results more closely.
                var equalsElementRegexp = /<td class="equal">([^<]+)<\/td>/;
                var equalMatches = body.match(equalsElementRegexp);
                jqUnit.assertNotNull("There should be 'equal' content.", equalMatches);
                for (var b = 1; b < equalMatches.length; b++) {
                    var equalElementText = equalMatches[b];
                    jqUnit.assertEquals("All 'equal' comparisons should end up displaying 'true'.", "true", equalElementText);
                }

                var unequalRegexp = /<td class="unequal">([^<]+)<\/td>/;
                var unequalMatches = body.match(unequalRegexp);
                jqUnit.assertNotNull("There should be 'unequal' content.", unequalMatches);
                for (var c = 1; c < unequalMatches.length; c++) {
                    var unequalElementText = unequalMatches[c];
                    jqUnit.assertEquals("All 'unequal' comparisons should end up displaying 'false'.", "false", unequalElementText);
                }

                // Tests for the "jsonify" (JSON.stringify) helper.  We don't use the standard function because we want to inspect the results more closely.
                var jsonifyElementRegexp = /<td class="jsonify">([^<]+)<\/td>/;
                var matches = body.match(jsonifyElementRegexp);
                jqUnit.assertNotNull("There should be jsonify content.", matches);
                for (var a = 1; a < matches.length; a++) {
                    var jsonString = matches[a];
                    var data = JSON.parse(jsonString);
                    jqUnit.assertDeepEq("The JSON data should match the model", that.options.json, data);

                }
            });
        });
    });

    jqUnit.asyncTest("Test 404 handling for dispatcher...", function () {
        request.get(that.options.config.express.baseUrl + "dispatcher/bogus", function (error, response) {
            jqUnit.start();

            jqUnit.assertNull("There should be no errors...", error);
            jqUnit.assertEquals("The status code should be 404...", 404, response.statusCode);
        });
    });

    jqUnit.asyncTest("Test multiple view directories with dispatcher...", function () {
        request.get(that.options.config.express.baseUrl + "dispatcher/secondary", function (error, response, body) {
            jqUnit.start();

            gpii.templates.tests.server.bodyMatches("The default layout should have been used...", body, /Main Layout/);
            gpii.templates.tests.server.bodyMatches("The secondary page should have been used...", body, /page served up from the secondary template directory/);
            gpii.templates.tests.server.bodyMatches("The secondary partial should have been used...", body, /partial served from the secondary template director/);
        });
    });

    jqUnit.asyncTest("Test overriding of content when using multiple view directories with dispatcher...", function () {
        request.get(that.options.config.express.baseUrl + "dispatcher/overridden", function (error, response, body) {
            jqUnit.start();

            gpii.templates.tests.server.bodyMatches("The layout should have come from the primary...", body, /layout found in the primary template directory/);
            gpii.templates.tests.server.bodyMatches("The page should have come from the primary", body, /page served up from the primary template directory/);
            gpii.templates.tests.server.bodyMatches("The partial should have come from the primary...", body, /partial served from the primary template directory/);
        });
    });

};

var when = require("when");
require("./lib/resolve-utils");
module.exports = when.promise(function (resolve) {
    gpii.express({
        config:  {
            "express": {
                "port" :   6904,
                "baseUrl": "http://localhost:6904/",
                "views":   viewDirs,
                "session": {
                    "secret": "Printer, printer take a hint-ter."
                }
            }
        },
        json: { foo: "bar", baz: "quux", qux: "quux" },
        listeners: {
            "onCreate.runTests": {
                funcName: "gpii.templates.tests.server.runTests",
                args:     ["{that}"]
            },
            "afterDestroy.resolvePromise": {
                funcName: "gpii.templates.tests.resolver.getDelayedResolutionFunction",
                args:    [resolve]
            }
        },
        components: {
            "json": {
                "type": "gpii.express.middleware.bodyparser.json"
            },
            "urlencoded": {
                "type": "gpii.express.middleware.bodyparser.urlencoded"
            },
            "cookieparser": {
                "type": "gpii.express.middleware.cookieparser"
            },
            "session": {
                "type": "gpii.express.middleware.session"
            },
            inline: {
                type: "gpii.express.hb.inline"
            },
            dispatcher: {
                type: "gpii.express.dispatcher",
                options: {
                    path: ["/dispatcher/:template", "/dispatcher"],
                    rules: {
                        contextToExpose: {
                            myvar:    { literalValue: "modelvariable" },
                            markdown: { literalValue: "*this works*" },
                            json:     { literalValue: "{express}.options.json" },
                            req:      { params: "req.params", query: "req.query"}
                        }
                    }
                }
            },
            handlebars: {
                type: "gpii.express.hb"
            }
        }
    });
});
