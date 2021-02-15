/*

    Test for "live reloading" when templates are changed.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.require("%fluid-handlebars");

var copy   = require("recursive-copy");
var fs     = require("fs");
var jqUnit = require("node-jqunit");
var os     = require("os");
var path   = require("path");
var rimraf = require("rimraf");

fluid.require("%fluid-express");
fluid.express.loadTestingSupport();

var kettle = require("kettle");
kettle.loadTestingSupport();

fluid.registerNamespace("fluid.tests.handlebars.live");

/**
 *
 * Confirm that a test string was added to the relevant template.
 *
 * @param {String} body - The body of the document returned to the request.
 * @param {String} expectedText - The text to look for in the body.
 * @param {Boolean} invert - Whether to invert the comparison (used to confirm that the text is not initially present).
 *
 */
fluid.tests.handlebars.live.verifyResults = function (body, expectedText, invert) {
    var jqUnitFn = invert ? "assertFalse" : "assertTrue";
    var outcome = invert ? "should not" : "should";
    jqUnit[jqUnitFn]("The expected text " + outcome + " be found...", body && body.indexOf(expectedText) !== -1);
};

fluid.defaults("fluid.tests.handlebars.live.request", {
    gradeNames: ["kettle.test.request.http"],
    port:       "{testEnvironment}.options.port",
    url:        "{testEnvironment}.options.baseUrl"
});

/**
 *
 * Add text to a template, which we should be able to see in the rendered output after a "live" reload.
 *
 * @param {String} templateDir - The full relativeTemplatePath to the template directory.
 * @param {String} relativeTemplatePath - The relativeTemplatePath to the template, relative to the above.
 * @param {String} textToAppend - The text to append to the template.
 *
 */
fluid.tests.handlebars.live.updateTemplate = function (templateDir, relativeTemplatePath, textToAppend) {
    var fullPath = path.resolve(templateDir, relativeTemplatePath) + ".handlebars";
    fs.appendFileSync(fullPath, textToAppend);
};

/**
 * A simple function to work around the limitations in jqUnit.assertLeftHand.  Allows us to test a single deep value
 * against an expected value.
 *
 * @param {String} message - The message to be passed to the test assertion (will appear in the test output).
 * @param {Object} root - The object to be inspected.
 * @param {String} path - The deep path (i.e. `path.to.value`) within `root`.
 * @param {String|Number|Boolean} expected - The expected value to be compared.  Note that `Array` and `Object` values are not handled properly.
 *
 */
fluid.tests.handlebars.live.pathEquals = function (message, root, path, expected) {
    var actual = fluid.get(root, path);
    jqUnit.assertEquals(message, expected, actual);
};

fluid.defaults("fluid.tests.handlebars.live.caseHolder", {
    gradeNames: ["fluid.test.express.caseHolder.base"],
    sequenceStart: [
        {
            func: "{testEnvironment}.events.cloneTemplates.fire"
        },
        {
            event: "{testEnvironment}.events.onTemplatesCloned",
            listener: "{testEnvironment}.events.constructFixtures.fire"
        },
        {
            event: "{testEnvironment}.events.onWatcherReady",
            listener: "fluid.identity"
        }
    ],
    sequenceEnd: [
        {
            func: "{testEnvironment}.express.destroy"
        },
        {
            event: "{testEnvironment}.express.events.afterDestroy",
            listener: "{testEnvironment}.events.cleanup.fire"
        },
        {
            event: "{testEnvironment}.events.onCleanupComplete",
            listener: "fluid.identity"
        }
    ],
    rawModules: [
        {
            name: "Testing live reloading of template content...",
            tests: [
                {
                    name: "The single template middleware should be able to handle reloads...",
                    type: "test",
                    sequence: [
                        {
                            func: "{initialSingleTemplateRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.live.verifyResults",
                            event:    "{initialSingleTemplateRequest}.events.onComplete",
                            args:     ["{arguments}.0", "I love single templates.", true] // body, expectedText, invert
                        },
                        {
                            func: "fluid.tests.handlebars.live.updateTemplate",
                            args: ["{testEnvironment}.options.templateDirs.unique", "pages/singleTemplateMiddleware", "I love single templates."] // templateDir, path, textToAppend
                        },
                        {
                            changeEvent: "{testEnvironment}.express.handlebars.renderer.applier.modelChanged",
                            path:        "templates",
                            listener:    "{postChangeSingleTemplateRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.live.verifyResults",
                            event:    "{postChangeSingleTemplateRequest}.events.onComplete",
                            args:     ["{arguments}.0", "I love single templates."] // body, expectedText, invert
                        }
                    ]
                },
                {
                    name: "The 'dispatcher' middleware should be able to handle reloads...",
                    type: "test",
                    sequence: [
                        {
                            func: "{initialDispatcherRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.live.verifyResults",
                            event:    "{initialDispatcherRequest}.events.onComplete",
                            args:     ["{arguments}.0", "I love dispatched templates.", true] // body, expectedText, invert
                        },
                        {
                            func: "fluid.tests.handlebars.live.updateTemplate",
                            args: ["{testEnvironment}.options.templateDirs.unique", "pages/index", "I love dispatched templates."] // templateDir, path, textToAppend
                        },
                        {
                            changeEvent: "{testEnvironment}.express.handlebars.renderer.applier.modelChanged",
                            path:        "templates",
                            listener:    "{postChangeDispatcherRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.live.verifyResults",
                            event:    "{postChangeDispatcherRequest}.events.onComplete",
                            args:     ["{arguments}.0", "I love dispatched templates."] // body, expectedText, invert
                        }
                    ]
                },
                {
                    name: "The 'inline' middleware should be able to handle reloads...",
                    type: "test",
                    sequence: [
                        {
                            func: "{initialInlineRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.live.pathEquals",
                            event:    "{initialInlineRequest}.events.onComplete",
                            args:     ["The original content should be unaltered when we begin.", "@expand:JSON.parse({arguments}.0)", "partials.renderer-partial", "This is partial content."] // message, root, path, expected
                        },
                        {
                            func: "fluid.tests.handlebars.live.updateTemplate",
                            args: ["{testEnvironment}.options.templateDirs.unique", "partials/renderer-partial", "  I love inline templates."] // templateDir, path, textToAppend
                        },
                        {
                            changeEvent: "{testEnvironment}.express.handlebars.renderer.applier.modelChanged",
                            path:        "templates",
                            listener:    "{postChangeInlineRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.live.pathEquals",
                            event:    "{postChangeInlineRequest}.events.onComplete",
                            args:     ["The updated content should be delivered in the payload.", "@expand:JSON.parse({arguments}.0)", "partials.renderer-partial", "This is partial content.  I love inline templates."] // message, root, path, expected
                        }
                    ]
                },
                {
                    name: "The error-rendering middleware should be able to handle reloads...",
                    type: "test",
                    sequence: [
                        {
                            func: "{initialErrorRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.live.verifyResults",
                            event:    "{initialErrorRequest}.events.onComplete",
                            args:     ["{arguments}.0", "I love error templates.", true] // body, expectedText, invert
                        },
                        {
                            func: "fluid.tests.handlebars.live.updateTemplate",
                            args: ["{testEnvironment}.options.templateDirs.unique", "pages/error", "I love error templates."] // templateDir, path, textToAppend
                        },
                        {
                            changeEvent: "{testEnvironment}.express.handlebars.renderer.applier.modelChanged",
                            path:        "templates",
                            listener:    "{postChangeErrorRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.live.verifyResults",
                            event:    "{postChangeErrorRequest}.events.onComplete",
                            args:     ["{arguments}.0", "I love error templates."] // body, expectedText, invert
                        }
                    ]
                }
            ]
        }
    ],
    components: {
        initialSingleTemplateRequest: {
            type: "fluid.tests.handlebars.live.request",
            options: {
                path: "/singleTemplate"
            }
        },
        postChangeSingleTemplateRequest: {
            type: "fluid.tests.handlebars.live.request",
            options: {
                path: "/singleTemplate"
            }
        },
        initialDispatcherRequest: {
            type: "fluid.tests.handlebars.live.request",
            options: {
                path: "/dispatcher"
            }
        },
        postChangeDispatcherRequest: {
            type: "fluid.tests.handlebars.live.request",
            options: {
                path: "/dispatcher"
            }
        },
        initialInlineRequest: {
            type: "fluid.tests.handlebars.live.request",
            options: {
                path: "/templates"
            }
        },
        postChangeInlineRequest: {
            type: "fluid.tests.handlebars.live.request",
            options: {
                path: "/templates"
            }
        },
        initialErrorRequest: {
            type: "fluid.tests.handlebars.live.request",
            options: {
                path: "/error"
            }
        },
        postChangeErrorRequest: {
            type: "fluid.tests.handlebars.live.request",
            options: {
                path: "/error"
            }
        }
    }
});

fluid.tests.handlebars.live.generateUniqueTemplateDir = function (that) {
    return path.resolve(os.tmpdir(), "live-templates-" + that.id);
};

/**
 * As we don't want to make changes to our actual template content, copy them to a temp directory where we can safely
 * make changes.
 *
 * @param {Object} that - The testEnvironment component itself.
 *
 */
fluid.tests.handlebars.live.cloneTemplates = function (that) {
    var resolvedSourcePath = fluid.module.resolvePath(that.options.templateSource);
    copy(resolvedSourcePath, that.options.templateDirs.unique, { dot: false }, function (error) {
        if (error) {
            fluid.fail(error);
        }
        else {
            that.events.onTemplatesCloned.fire();
        }
    });
};

fluid.tests.handlebars.live.cleanup = function (that) {
    rimraf(that.options.templateDirs.unique, function (error) {
        if (error) {
            fluid.log("Error removing cloned template content:", error);
        }
        else {
            fluid.log("Removed cloned template content....");
            that.events.onCleanupComplete.fire();
        }
    });
};

fluid.registerNamespace("fluid.tests.handlebars.live.errorRenderingMiddleware.errorGeneratingMiddleware");
fluid.tests.handlebars.live.errorRenderingMiddleware.errorGeneratingMiddleware.middleware = function (next) {
    next({ isError: true, message: "nothing good can come from this..."});
};

fluid.defaults("fluid.tests.handlebars.live.errorRenderingMiddleware.errorGeneratingMiddleware", {
    gradeNames: ["fluid.express.middleware"],
    path:       "/error",
    namespace:  "errorGeneratingMiddleware",
    invokers: {
        middleware: {
            funcName: "fluid.tests.handlebars.live.errorRenderingMiddleware.errorGeneratingMiddleware.middleware",
            args:     ["{arguments}.2"] // req, res, next
        }
    }
});

fluid.defaults("fluid.tests.handlebars.live.environment", {
    gradeNames:  ["fluid.test.express.testEnvironment"],
    port: 6484,
    events: {
        cloneTemplates:    null,
        cleanup:           null,
        onCleanupComplete: null,
        onWatcherReady:    null,
        onTemplatesCloned: null
    },
    templateSource: "%fluid-handlebars/tests/templates/primary",
    templateDirs: {
        unique: "@expand:fluid.tests.handlebars.live.generateUniqueTemplateDir({that})"
    },
    listeners: {
        "cloneTemplates.cloneTemplates": {
            funcName: "fluid.tests.handlebars.live.cloneTemplates",
            args:     ["{that}"]
        },
        "cleanup.cleanup": {
            funcName: "fluid.tests.handlebars.live.cleanup",
            args:     ["{that}"]
        }
    },
    components: {
        express: {
            options: {
                events: {
                    onFsChange: null
                },
                listeners: {
                    "onFsChange.reloadInlineTemplates": {
                        func: "{inlineMiddleware}.events.loadTemplates.fire"
                    }
                },
                components: {
                    handlebars: {
                        type: "fluid.express.hb.live",
                        options: {
                            templateDirs: "{fluid.tests.handlebars.live.environment}.options.templateDirs",
                            listeners: {
                                "onWatcherReady.notifyEnvironment": {
                                    func: "{testEnvironment}.events.onWatcherReady.fire"
                                },
                                "onFsChange.notifyExpress": {
                                    func: "{fluid.express}.events.onFsChange.fire"
                                }
                            }
                        }
                    },
                    dispatcher: {
                        type: "fluid.handlebars.dispatcherMiddleware",
                        options: {
                            path: ["/dispatcher/:template", "/dispatcher"],
                            templateDirs: "{fluid.tests.handlebars.live.environment}.options.templateDirs"
                        }
                    },
                    singleTemplateMiddleware: {
                        type: "fluid.express.singleTemplateMiddleware",
                        options: {
                            path: "/singleTemplate",
                            templateKey: "pages/singleTemplateMiddleware"
                        }
                    },
                    inlineMiddleware: {
                        type: "fluid.handlebars.inlineTemplateBundlingMiddleware",
                        options: {
                            path: "/templates",
                            templateDirs: "{fluid.tests.handlebars.live.environment}.options.templateDirs"
                        }
                    },
                    errorGeneratingMiddleware: {
                        type: "fluid.tests.handlebars.live.errorRenderingMiddleware.errorGeneratingMiddleware"
                    },
                    htmlErrorHandler: {
                        type: "fluid.handlebars.errorRenderingMiddleware",
                        options: {
                            templateKey: "pages/error",
                            priority: "after:errorGeneratingMiddleware"
                        }
                    }
                }
            }
        },
        caseHolder: {
            type: "fluid.tests.handlebars.live.caseHolder"
        }
    }
});

fluid.test.runTests("fluid.tests.handlebars.live.environment");
