/*

    The test fixtures used for browser testing.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var path = require("path");

require("gpii-express");
gpii.express.loadTestingSupport();

require("../../test-harness");
require("./helpers");

fluid.registerNamespace("gpii.test.handlebars.browser.caseHolder");

gpii.test.handlebars.browser.caseHolder.saveCoverageData = function (that, coverageData) {
    var filename = "coverage-webdriver-" + Date.now() + "-" + that.id + ".json";

    var realBasePath = path.resolve(fluid.module.resolvePath("%gpii-handlebars"), "..");
    var crudelyResolvedPath = fluid.stringTemplate(that.options.coverageDir, { "gpii-handlebars": realBasePath });

    gpii.test.handlebars.browser.saveCoverageData(crudelyResolvedPath, filename, coverageData);
};

/*

    A caseholder to take care of optionally collecting coverage data at the end of each run.

 */
fluid.defaults("gpii.test.handlebars.browser.caseHolder.base", {
    gradeNames: ["gpii.test.webdriver.caseHolder.base"],
    coverageDir: "%gpii-handlebars/coverage",
    sequenceStart: gpii.test.express.standardSequenceStart,
    sequenceEnd: [
        {
            func: "{gpii.test.handlebars.browser.environment}.webdriver.executeScript",
            args: [gpii.test.handlebars.browser.getCoverageData]
        },
        {
            event:    "{gpii.test.handlebars.browser.environment}.webdriver.events.onExecuteScriptComplete",
            listener: "gpii.test.handlebars.browser.caseHolder.saveCoverageData",
            args:     ["{that}", "{arguments}.0"]
        },
        { func: "{gpii.test.handlebars.browser.environment}.events.stopFixtures.fire", args: [] },
        { listener: "fluid.identity", event: "{testEnvironment}.events.onFixturesStopped"}
    ]
});

/*

    A caseholder that includes "Match definitions" to allow us to run multiple checks on a rendered element in one step.
    Steps like the following will run the standard checks:


    ```
     {
     event:    "{testEnvironment}.webdriver.events.onGetComplete",
     listener: "{testEnvironment}.webdriver.findElement",
     args:     [{ css: ".viewport-append"}]
     },
     {
     event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
     listener: "gpii.test.handlebars.sanityCheckElements",
     args:     ["{arguments}.0", "{that}.options.matchDefs.standard"] //elements, matchDefs
     },
    ```

 */
fluid.defaults("gpii.test.handlebars.browser.caseHolder", {
    gradeNames: ["gpii.test.handlebars.browser.caseHolder.base"],
    matchDefs: {
        standard: {
            markdown: {
                message: "The element should contain rendered markdown...",
                pattern: "this works",
                locator: { css: ".markdown p em"}
            },
            variable: {
                message: "The new element should contain rendered variable content...",
                pattern: "modelvariable",
                locator: { css: ".variable"}
            },
            partial: {
                message: "The element after the original should have rendered content...",
                pattern:  "from the partial"
            },
            equals: {
                message: "Equal comparisons should display the correct text (true)...",
                pattern: "true",
                locator: { css: ".equal"}
            },
            unequals: {
                message: "Unequal comparisons should display the correct text (false)...",
                pattern: "false",
                locator: { css: ".unequal"}
            }
        },
        noOriginalContent: {
            message: "The original content should no longer be found...",
            pattern: "original content",
            invert:  true
        },
        originalContent: {
            message: "The original content should be preserved in its entirety...",
            pattern: "^original content$"
        },
        originalContentAtBeginning: {
            message: "The original content should still be at the start of the element...",
            pattern: "^original content.+"
        },
        originalContentAtEnd: {
            message: "The original content should be found at the end of the element",
            pattern: "original content$"
        }
    }
});


// A standard express + Browser environment from the `gpii-webdriver` package, with our harness options wired
// into the standard express component.
//
fluid.defaults("gpii.test.handlebars.browser.environment", {
    gradeNames: ["gpii.test.webdriver.testEnvironment.withExpress"],
    port: 6984,
    path: "",
    components: {
        express: {
            type: "gpii.test.handlebars.client.harness"
        }
    }
});
