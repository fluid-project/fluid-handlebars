// Helpers intended to be used with Nightmare's `evaluate` function to examine client-side content.
//
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.test.handlebars.browser");

var jqUnit = require("node-jqunit");

var fs   = require("fs");
var path = require("path");

require("../../../../");

/* globals $ */

gpii.test.handlebars.browser.equalThingsAreTrue = function (path, fnName) {
    var element = fnName ? $(path)[fnName]() : $(path);
    var equalCandidates = element.find(".equal");
    for (var a = 0; a < equalCandidates.length; a++) {
        if ($(equalCandidates[a]).text() !== "true") {
            return false;
        }
    }

    return true;
};

gpii.test.handlebars.browser.unequalThingsAreFalse = function (path, fnName) {
    var element = fnName ? $(path)[fnName]() : $(path);
    var unequalCandidates = element.find(".unequal");
    for (var b = 0; b < unequalCandidates.length; b++) {
        if ($(unequalCandidates[b]).text() !== "false") {
            return false;
        }
    }

    return true;
};

gpii.test.handlebars.browser.getJSONContent = function (path) {
    return JSON.parse($(path).html());
};

gpii.test.handlebars.browser.getCoverageData = function () {
    return JSON.stringify(window.__coverage__ || {}, null, 2);
};

gpii.test.handlebars.browser.saveCoverageData = function (coveragePath, filename, data) {
    var outputPath = path.resolve(coveragePath, filename);
    fs.writeFileSync(outputPath, data);
};

/**
 *
 * Test a single WebElement to see if it matches a pattern.
 *
 * @param {String} message A description of this specific test.
 * @param {WebElement} element The element returned by `findElement` or `findElements`.
 * @param {String} elementFn The `element` function name to use to retrieve the value.
 * @param {Regexp} pattern The pattern to test the return value against.
 * @param {Boolean} invert Whether to invert the match (consider the fact that it's missing as success.
 */
gpii.test.handlebars.elementMatches = function (message, element, elementFn, pattern, invert) {
    jqUnit.stop();
    element[elementFn]().then(function (contentToExamine) {
        jqUnit.start();
        var fnName = invert ? "assertFalse" : "assertTrue";
        jqUnit[fnName](message, contentToExamine.match(pattern));
    })["catch"](fluid.fail);
};


/**
 *
 * Inspect one or more elements against a range of patterns.  Used to avoid having repeated test sequences for
 * common renderer checks.  Calls `gpii.test.handlebars.elementMatches` (see above) for each element and match
 * definition.
 *
 * @param {Array|Object} elements One or more WebElement instances, as returned by findElement or findElements.
 * @param {Object} matchDefs A structure that defines the `message` associated with the test, the `elementFn` to use to get the value, and the `pattern' to compare to the value.  May include a 'locator' to inspect a sub-element.
 *
 */
gpii.test.handlebars.sanityCheckElements = function (elements, matchDefs) {
    fluid.each(fluid.makeArray(elements), function (element) {
        fluid.each(matchDefs, function (matchDef) {
            if (matchDef.locator) {
                element.findElements(matchDef.locator).then(function (subElements) {
                    var pass = 1;
                    fluid.each(subElements, function (subElement) {
                        gpii.test.handlebars.elementMatches(matchDef.message + " (pass " + pass + ")", subElement, matchDef.elementFn || "getText", matchDef.pattern, matchDef.invert);
                        pass++;
                    });
                })["catch"](fluid.fail);
            }
            else {
                gpii.test.handlebars.elementMatches(matchDef.message, element, matchDef.elementFn || "getText", matchDef.pattern, matchDef.invert);
            }
        });
    });
};
