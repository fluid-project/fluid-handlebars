// Test the base "template aware" component.
/* eslint-env browser */
(function (fluid) {
    "use strict";
    // Test components to render content.
    fluid.defaults("fluid.tests.templateAware.serverResourceAware", {
        gradeNames: ["fluid.tests.handlebars.templateAware.serverResourceAware"],
        template:   "index",
        selectors: {
            initial: "" // Update the whole container
        },
        model: {
            myvar:    "modelvariable",
            markdown: "*this works*",
            json:     { foo: "bar", baz: "quux", qux: "quux" }
        },
        invokers: {
            renderInitialMarkup: {
                func: "{that}.renderMarkup",
                args: [ "initial", "{that}.options.template", "{that}.model", "html"] // selector, template, data, manipulator
            }
        }
    });

    fluid.defaults("fluid.tests.templateAware.contained", {
        gradeNames: ["fluid.tests.templateAware.serverResourceAware"],
        template:  "form-contained-initial",
        selectors: {
            initial: ".contained-inner" // Update an interior element without disturbing the root container.
        }
    });

    fluid.defaults("fluid.tests.templateAware.testCaseHolder", {
        gradeNames: ["fluid.test.testCaseHolder"],
        matchDefs: {
            contained: {
                outside: {
                    message: "Content outside of the inner container should not have been disturbed...",
                    pattern: "This content should not be overwritten."
                },
                inside: {
                    message: "The original content of the inner container should have been updated...",
                    pattern: "A place for everything, and everything in its place."
                }
            }
        },
        modules: [{
            name: "Testing the `templateAware` client side grade.",
            tests: [{
                name: "Confirm that the templateAware component is rendered correctly.",
                expect: 9,
                sequence: [
                    {
                        func: "{testEnvironment}.events.createFixtures.fire"
                    },
                    {
                        event: "{testEnvironment}.events.allRendered",
                        listener: "fluid.identity"
                    },
                    {
                        funcName: "fluid.test.handlebars.browser.sanityCheckSelectors",
                        args: [".viewport", fluid.test.handlebars.browser.matchDefs.standard]
                    },
                    {
                        funcName: "fluid.test.handlebars.browser.sanityCheckSelectors",
                        args: [".contained", "{that}.options.matchDefs.contained"]
                    }
                ]
            }]
        }]
    });

    fluid.defaults("fluid.tests.templateAware.testEnvironment", {
        gradeNames: ["fluid.test.testEnvironment"],
        events: {
            createFixtures: null,
            mainRendered: null,
            containedRendered: null,
            allRendered: {
                events: {
                    mainRendered: "mainRendered",
                    containedRendered: "containedRendered"
                }
            }
        },
        components: {
            main: {
                type: "fluid.tests.templateAware.serverResourceAware",
                container: ".viewport",
                createOnEvent: "{that}.events.createFixtures",
                options: {
                    listeners: {
                        "onMarkupRendered.notifyParent": {
                            func: "{fluid.tests.templateAware.testEnvironment}.events.mainRendered.fire"
                        }
                    }
                }
            },
            contained: {
                type: "fluid.tests.templateAware.contained",
                container: ".contained",
                createOnEvent: "{that}.events.createFixtures",
                options: {
                    listeners: {
                        "onMarkupRendered.notifyParent": {
                            func: "{fluid.tests.templateAware.testEnvironment}.events.containedRendered.fire"
                        }
                    }
                }
            },
            caseHolder: {
                type: "fluid.tests.templateAware.testCaseHolder"
            }
        }
    });

    fluid.test.runTests("fluid.tests.templateAware.testEnvironment");
})(fluid);
