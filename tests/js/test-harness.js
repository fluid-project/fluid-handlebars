/*
    Test harness common to all Zombie tests.  Loads all required server-side components.
 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("gpii-express");

require("../../");

require("./lib/test-router-error");

fluid.defaults("gpii.test.handlebars.client.harness", {
    gradeNames:  ["gpii.express"],
    port: 6994,
    baseUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["http://localhost:%port/", { port: "{that}.options.port"}]
        }
    },
    templateDirs: ["%gpii-handlebars/tests/templates/primary", "%gpii-handlebars/tests/templates/secondary"],
    messageDirs: ["%gpii-handlebars/tests/messages/primary", "%gpii-handlebars/tests/messages/secondary"],
    contextToOptionsRules: {
        model: {
            "":       "notfound",
            req:      "req",
            myvar:    "myvar",
            markdown: "markdown",
            json:     "json"
        }
    },
    distributeOptions: {
        source: "{that}.options.contextToOptionsRules",
        target: "{that gpii.handlebars.helper.initBlock}.options.contextToOptionsRules"
    },
    components: {
        handlebars: {
            type: "gpii.express.hb",
            options: {
                templateDirs: "{harness}.options.templateDirs",
                members: {
                    messageBundles: "{messageLoader}.messageBundles"
                }
            }
        },
        dispatcher: {
            type: "gpii.handlebars.dispatcherMiddleware",
            options: {
                priority: "after:handlebars",
                path: ["/dispatcher/:template", "/dispatcher"],
                templateDirs: "{harness}.options.templateDirs",
                rules: {
                    contextToExpose: {
                        myvar:    { literalValue: "modelvariable" },
                        markdown: { literalValue: "*this works*" },
                        json:     { literalValue: { foo: "bar", baz: "quux", qux: "quux" } },
                        req:      { params: "req.params", query: "req.query"}
                    }
                }
            }
        },
        inline: {
            type: "gpii.handlebars.inlineTemplateBundlingMiddleware",
            options: {
                path: "/hbs",
                templateDirs: "{harness}.options.templateDirs"
            }
        },
        messageLoader: {
            type: "gpii.handlebars.i18n.messageLoader",
            options: {
                messageDirs: "{harness}.options.messageDirs"
            }
        },
        messages: {
            type: "gpii.handlebars.inlineMessageBundlingMiddleware",
            options: {
                messageDirs: "{harness}.options.messageDirs",
                model: {
                    messageBundles: "{messageLoader}.model.messageBundles"
                }
            }
        },
        js: {
            type: "gpii.express.router.static",
            options: {
                path:    "/src",
                content: "%gpii-handlebars/src"
            }
        },
        modules: {
            type: "gpii.express.router.static",
            options: {
                path:    "/node_modules",
                content: "%gpii-handlebars/node_modules"
            }
        },
        content: {
            type: "gpii.express.router.static",
            options: {
                path:    "/content",
                content: "%gpii-handlebars/tests/static"
            }
        },
        error: {
            type: "gpii.test.handlebars.jsonErrorPitcher"
        },
        errorJsonString: {
            type: "gpii.test.handlebars.jsonErrorPitcher",
            options: {
                path: "/errorJsonString",
                body: JSON.stringify({ok: false, message: "There was a problem.  I'm telling you about it using a stringified JSON response.  Hope that's OK with you."})
            }
        },
        errorString: {
            type: "gpii.test.handlebars.jsonErrorPitcher",
            options: {
                path: "/errorString",
                body: "There was a problem.  I'm telling you about it with a string response, hopefully this doesn't cause another problem."
            }
        }
    }
});
