/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.require("%fluid-handlebars");

fluid.require("%fluid-express");
fluid.express.loadTestingSupport();

var jqUnit = require("node-jqunit");

var request = require("request");

require("./lib/fixtures");

fluid.registerNamespace("fluid.tests.handlebars.inlineMessageBundlingMiddleware");

fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle = function (response, returnedBundle, expected) {
    jqUnit.assertEquals("The response code should be as expected.", 200, response.statusCode);
    jqUnit.assertLeftHand("The returned message bundle body should contain the expected content.", expected, returnedBundle);
};

fluid.defaults("fluid.tests.handlebars.inlineMessageBundlingMiddleware.request.noHeaders", {
    gradeNames: ["fluid.test.handlebars.request"],
    endpoint: "messages"
});

fluid.defaults("fluid.tests.handlebars.inlineMessageBundlingMiddleware.request", {
    gradeNames: ["fluid.tests.handlebars.inlineMessageBundlingMiddleware.request.noHeaders"],
    acceptLanguageHeaders: "en-US",
    headers: {
        "Accept-Language": "{fluid.tests.handlebars.inlineMessageBundlingMiddleware.request}.options.acceptLanguageHeaders"
    }
});

fluid.tests.handlebars.inlineMessageBundlingMiddleware.testBundleCaching = function (testEnvironment) {
    var messagesEndpoint = "http://localhost:" + testEnvironment.options.port + "/messages";

    var firstRequestOptions = {
        url: messagesEndpoint
    };

    jqUnit.stop();
    request(firstRequestOptions, function (error, response, body) {
        jqUnit.start();

        jqUnit.assertEquals("There should not be an error.", null, error);

        jqUnit.assertNotUndefined("The body should be defined.", body);

        var etag = fluid.get(response, ["headers", "etag"]);
        if (etag) {
            var secondRequestOptions = {
                url: messagesEndpoint,
                headers: {
                    "If-None-Match": etag
                }
            };
            jqUnit.stop();
            request(secondRequestOptions, function (error, response, body) {
                jqUnit.start();
                jqUnit.assertEquals("There should not be an error.", null, error);
                jqUnit.assertEquals("There should not be a body.", "", body);
                jqUnit.assertEquals("The status code should be correct.", 304, response.statusCode);
            });
        }
        else {
            jqUnit.fail("There should have been an etag in the first response");
        }
    });
};

fluid.defaults("fluid.tests.handlebars.inlineMessageBundlingMiddleware.caseHolder", {
    gradeNames: ["fluid.test.express.caseHolder"],
    expected: {
        // equivalent to "en-US"
        noHeaders: {
            "four-oh-four": "Nothing to see here.",
            "shallow-variable": "This is %condition.",
            "message-key-language-only": "Works."
        },
        // equivalent to "en-US"
        localeFailover: {
            "four-oh-four": "Nothing to see here.",
            "shallow-variable": "This is %condition.",
            "message-key-language-only": "Works."
        },
        // equivalent to "en-US"
        languageFailover: {
            "four-oh-four": "Nothing to see here.",
            "shallow-variable": "This is %condition.",
            "message-key-language-only": "Works."
        },
        // equivalent to "en-US"
        threeCharacterLanguage: {
            "four-oh-four": "Nothing to see here.",
            "shallow-variable": "This is %condition.",
            "message-key-language-only": "Works."
        },
        enLanguage: {
            "four-oh-four": "Page not found.",
            "shallow-variable": "This is %condition.",
            "message-key-language-only": "Works."
        },
        enGbLocale: {
            "four-oh-four": "Oh dear.  Nothing here.",
            noQuotes: "Quote 'works' unquote.",
            "shallow-variable": "This is %condition.",
            "message-key-language-only": "Works."
        },
        enUsLocale: {
            "four-oh-four": "Nothing to see here.",
            "shallow-variable": "This is %condition.",
            "message-key-language-only": "Works."
        },
        nlLanguage: {
            "how-are-things": "Het gaat goed.",
            "shallow-variable": "This is %condition."
        },
        nlBeLocale: {
            "how-are-things": "Het gaat goed.",
            "shallow-variable": "This is %condition.",
            "keyboard": "klavier",
            "four-oh-four": "Hier is er geen kat."
        },
        nlNlLocale: {
            "how-are-things": "Het gaat goed.",
            "shallow-variable": "This is %condition.",
            "keyboard": "toetsenbord",
            "four-oh-four": "Hier is er geen hond."
        },
        queryLocaleRequest: {
            "four-oh-four": "Oh dear.  Nothing here.",
            noQuotes: "Quote 'works' unquote.",
            "shallow-variable": "This is %condition.",
            "message-key-language-only": "Works."
        },
        // equivalent to "en"
        weightedLocale: {
            "shallow-variable": "This is %condition.",
            "four-oh-four": "Page not found.",
            "message-key-language-only": "Works."
        },
        // equivalent to "en-US".
        wildcardLocale: {
            "shallow-variable": "This is %condition.",
            "four-oh-four": "Nothing to see here.",
            "message-key-language-only": "Works."
        }
    },
    rawModules: [
        {
            name: "Testing message bundling middleware...",
            tests: [
                {
                    name: "Message bundle caching should work as expected.",
                    type: "test",
                    sequence: [{
                        func: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.testBundleCaching",
                        args: ["{testEnvironment}"]
                    }]
                },
                {
                    name: "The default language should be used if there are no Accept-Language headers.",
                    type: "test",
                    sequence: [
                        {
                            func: "{noHeadersRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{noHeadersRequest}.events.onComplete",
                            args:     ["{noHeadersRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.noHeaders"] // response, returnedBundle, expected
                        }
                    ]
                },
                {
                    name: "We should be able to fail over from a locale with no messages to the underlying language.",
                    type: "test",
                    sequence: [
                        {
                            func: "{localeFailoverRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{localeFailoverRequest}.events.onComplete",
                            args:     ["{localeFailoverRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.localeFailover"] // response, returnedBundle, expected
                        }
                    ]
                },
                {
                    name: "We should be able to fail over from a language with no messages to the default locale.",
                    type: "test",
                    sequence: [
                        {
                            func: "{languageFailoverRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{languageFailoverRequest}.events.onComplete",
                            args:     ["{languageFailoverRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.languageFailover"] // response, returnedBundle, expected
                        }
                    ]
                },
                {
                    name: "We should be able to handle three character language codes.",
                    type: "test",
                    sequence: [
                        {
                            func: "{threeCharacterLanguageRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{threeCharacterLanguageRequest}.events.onComplete",
                            args:     ["{threeCharacterLanguageRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.threeCharacterLanguage"] // response, returnedBundle, expected
                        }
                    ]
                },
                {
                    name: "We should be able to handle a request for the language 'en'.",
                    type: "test",
                    sequence: [
                        {
                            func: "{enLanguageRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{enLanguageRequest}.events.onComplete",
                            args:     ["{enLanguageRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.enLanguage"] // response, returnedBundle, expected
                            //args:     ["{enLanguageRequest}.nativeResponse", "{arguments}.0", "{caseHolder}.options.expected.enLanguage"] // response, returnedBundle, expected
                        }
                    ]
                },
                {
                    name: "We should be able to handle a request for the locale 'en_GB'.",
                    type: "test",
                    sequence: [
                        {
                            func: "{enGbLocaleRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{enGbLocaleRequest}.events.onComplete",
                            args:     ["{enGbLocaleRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.enGbLocale"] // response, returnedBundle, expected
                        }
                    ]
                },
                {
                    name: "We should be able to handle a request for the default locale 'en_US'.",
                    type: "test",
                    sequence: [
                        {
                            func: "{enUsLocaleRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{enUsLocaleRequest}.events.onComplete",
                            args:     ["{enUsLocaleRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.enUsLocale"] // response, returnedBundle, expected
                        }
                    ]
                },
                {
                    name: "We should be able to handle a request for the language 'nl'.",
                    type: "test",
                    sequence: [
                        {
                            func: "{nlLanguageRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{nlLanguageRequest}.events.onComplete",
                            args:     ["{nlLanguageRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.nlLanguage"] // response, returnedBundle, expected
                        }
                    ]
                },
                {
                    name: "We should be able to handle a request for the locale 'nl_BE'.",
                    type: "test",
                    sequence: [
                        {
                            func: "{nlBeLocaleRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{nlBeLocaleRequest}.events.onComplete",
                            args:     ["{nlBeLocaleRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.nlBeLocale"] // response, returnedBundle, expected
                        }
                    ]
                },
                {
                    name: "We should be able to handle a request for the locale 'nl_NL'.",
                    type: "test",
                    sequence: [
                        {
                            func: "{nlNlLocaleRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{nlNlLocaleRequest}.events.onComplete",
                            args:     ["{nlNlLocaleRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.nlNlLocale"] // response, returnedBundle, expected
                        }
                    ]
                },
                {
                    name: "We should be able to specify a locale as a query parameter.",
                    type: "test",
                    sequence: [
                        {
                            func: "{queryLocaleRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{queryLocaleRequest}.events.onComplete",
                            args:     ["{queryLocaleRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.queryLocaleRequest"] // response, returnedBundle, expected
                        }
                    ]
                },
                {
                    name: "We should be able to handle a request for a weighted set of preferred languages.",
                    type: "test",
                    sequence: [
                        {
                            func: "{weightedLocaleRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{weightedLocaleRequest}.events.onComplete",
                            args:     ["{weightedLocaleRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.weightedLocale"] // response, returnedBundle, expected
                        }
                    ]
                },
                {
                    name: "A wildcard in the Accept-Language header should return the data for the default locale.",
                    type: "test",
                    sequence: [
                        {
                            func: "{wildcardLocaleRequest}.send"
                        },
                        {
                            listener: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.verifyLanguageBundle",
                            event:    "{wildcardLocaleRequest}.events.onComplete",
                            args:     ["{wildcardLocaleRequest}.nativeResponse", "@expand:JSON.parse({arguments}.0)", "{caseHolder}.options.expected.wildcardLocale"] // response, returnedBundle, expected
                        }
                    ]
                }
            ]
        }
    ],
    components: {
        noHeadersRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request.noHeaders"
        },
        localeFailoverRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request",
            options: {
                acceptLanguageHeaders: "en-ca"
            }
        },
        languageFailoverRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request",
            options: {
                acceptLanguageHeaders: "fr"
            }
        },
        threeCharacterLanguageRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request",
            options: {
                acceptLanguageHeaders: "tlh" // Klingon
            }
        },
        enLanguageRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request",
            options: {
                acceptLanguageHeaders: "en"
            }
        },
        enGbLocaleRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request",
            options: {
                acceptLanguageHeaders: "en-GB"
            }
        },
        enUsLocaleRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request",
            options: {
                acceptLanguageHeaders: "en-US"
            }
        },
        nlLanguageRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request",
            options: {
                acceptLanguageHeaders: "nl"
            }
        },
        nlBeLocaleRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request",
            options: {
                acceptLanguageHeaders: "nl-BE"
            }
        },
        nlNlLocaleRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request",
            options: {
                acceptLanguageHeaders: "nl-NL"
            }

        },
        queryLocaleRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request",
            options: {
                endpoint: "messages?locale=en-GB"
            }
        },
        weightedLocaleRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request",
            options: {
                acceptLanguageHeaders: "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5"
            }
        },
        wildcardLocaleRequest: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.request",
            options: {
                acceptLanguageHeaders: "*"
            }
        }
    }
});

fluid.defaults("fluid.tests.handlebars.inlineMessageBundlingMiddleware.environment", {
    gradeNames:  ["fluid.test.express.testEnvironment"],
    port: 6494,
    events: {
        messagesLoaded: null,
        onFixturesConstructed: {
            events: {
                onExpressReady: "onExpressReady"
            }
        }
    },
    components: {
        express: {
            options: {
                components: {
                    messageBundleLoader: {
                        type: "fluid.handlebars.i18n.messageBundleLoader",
                        options: {
                            messageDirs: {
                                primary: "%fluid-handlebars/tests/messages/primary",
                                secondary: "%fluid-handlebars/tests/messages/secondary"
                            }
                        }
                    },
                    inlineMessageBundlingMiddleware: {
                        type: "fluid.handlebars.inlineMessageBundlingMiddleware",
                        options: {
                            model: {
                                messageBundles: "{messageBundleLoader}.model.messageBundles"
                            }
                        }
                    }
                }
            }
        },
        caseHolder: {
            type: "fluid.tests.handlebars.inlineMessageBundlingMiddleware.caseHolder"
        }
    }
});

fluid.test.runTests("fluid.tests.handlebars.inlineMessageBundlingMiddleware.environment");
