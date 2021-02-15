// Tests for the "single template router".
//
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.require("%fluid-handlebars");

var jqUnit = require("node-jqunit");
var cheerio = require("cheerio");

fluid.require("%fluid-express");
fluid.express.loadTestingSupport();

var kettle = require("kettle");
kettle.loadTestingSupport();

require("./lib/fixtures");

fluid.registerNamespace("fluid.tests.handlebars.singleTemplateMiddleware");

// Verify the results of a request.  Accepts the following values:
//
// `response`: The native response returned by `kettle.request.http`.
//
// `body`: The request body returned by `kettle.request.http`
//
// `statusCode`: The numeric status code that is expected.
//
// `expected`: A map whose keys are jQuery selectors that correspond to a single element found in the page, and whose values
// are the expected trimmed output of the `text()` function for a given element, as in:
//
//  { "#myId": "These are my contents." }
//
// `notExpected`: An array of selectors that should either not be found or that should not contain any output.
//
fluid.tests.handlebars.singleTemplateMiddleware.verifyResults = function (response, body, statusCode, expected, notExpected) {
    jqUnit.assertEquals("The status code should be as expected...", statusCode, response.statusCode);

    var $ = cheerio.load(body);

    if (expected) {
        fluid.each(expected, function (expectedValue, expectedSelector) {
            var matchingElements = $(expectedSelector);
            jqUnit.assertEquals("There should be exactly one matching element...", 1, matchingElements.length);

            jqUnit.assertEquals("The text should be as expected...", expectedValue, matchingElements.text().trim());
        });
    }

    if (notExpected) {
        fluid.each(notExpected, function (notExpectedSelector) {
            var matchingElements = $(notExpectedSelector);
            jqUnit.assertTrue("The element should not be found...", matchingElements.length === 0);
        });
    }
};

fluid.defaults("fluid.tests.handlebars.singleTemplateMiddleware.request", {
    gradeNames: ["fluid.test.handlebars.request"]
});

fluid.defaults("fluid.tests.handlebars.singleTemplateMiddleware.caseHolder", {
    gradeNames: ["fluid.test.express.caseHolder"],
    rawModules: [
        {
            name: "Testing single template middleware...",
            tests: [
                {
                    name: "Confirm that a template is rendered without request data...",
                    type: "test",
                    sequence: [
                        {
                            func: "{noDataRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.singleTemplateMiddleware.verifyResults",
                            event:    "{noDataRequest}.events.onComplete",
                            args:     ["{noDataRequest}.nativeResponse", "{arguments}.0", 200, false, ["#req-myvar"]]
                        }
                    ]
                },
                {
                    name: "Confirm that a template is rendered with request data...",
                    type: "test",
                    sequence: [
                        {
                            func: "{dataRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.singleTemplateMiddleware.verifyResults",
                            event:    "{dataRequest}.events.onComplete",
                            args:     ["{dataRequest}.nativeResponse", "{arguments}.0", 200, {"#req-myvar": "query data"}]
                        }
                    ]
                }
            ]
        }
    ],
    components: {
        noDataRequest: {
            type: "fluid.tests.handlebars.singleTemplateMiddleware.request"
        },
        dataRequest: {
            type: "fluid.tests.handlebars.singleTemplateMiddleware.request",
            options: {
                endpoint: "?myvar=query+data"
            }
        }
    }
});

fluid.defaults("fluid.tests.handlebars.singleTemplateMiddleware.environment", {
    gradeNames:  ["fluid.test.express.testEnvironment"],
    port: 6494,
    components: {
        express: {
            options: {
                components: {
                    urlencoded: {
                        type: "fluid.express.middleware.bodyparser.urlencoded"
                    },
                    singleTemplateMiddleware: {
                        type: "fluid.express.singleTemplateMiddleware",
                        options: {
                            templateKey: "pages/singleTemplateMiddleware"
                        }
                    },
                    handlebars: {
                        type: "fluid.express.hb",
                        options: {
                            templateDirs:   ["%fluid-handlebars/tests/templates/primary"]
                        }
                    }
                }
            }
        },
        caseHolder: {
            type: "fluid.tests.handlebars.singleTemplateMiddleware.caseHolder"
        }
    }
});

fluid.test.runTests("fluid.tests.handlebars.singleTemplateMiddleware.environment");
