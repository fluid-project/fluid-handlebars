/*
    Test harness common to all Zombie tests.  Loads all required server-side components.
 */
var fluid = fluid || require("infusion");
var path  = require("path");

require("gpii-express");

require("../../");
require("./test-router-error");

// Test content (HTML, JS, templates)
var testDir    = path.resolve(__dirname, "..");
var contentDir = path.join(testDir, "static");
var viewDir    = path.join(testDir, "views");

// Dependencies
var bcDir      = path.resolve(__dirname, "../../bower_components");
var modulesDir = path.resolve(__dirname, "../../node_modules");

// Main source to be tested
var srcDir     = path.resolve(__dirname, "../../src");

fluid.defaults("gpii.templates.hb.tests.client.harness", {
    gradeNames: ["gpii.express", "autoInit"],
    expressPort: 6994,
    baseUrl: "http://localhost:6994/",
    config:  {
        express: {
            "port" :   "{that}.options.expressPort",
            baseUrl: "{that}.options.baseUrl",
            views:   viewDir
        }
    },
    components: {
        inline: {
            type: "gpii.express.hb.inline",
            options: {
                path: "/hbs"
            }
        },
        bc: {
            type: "gpii.express.router.static",
            options: {
                path:    "/bc",
                content: bcDir
            }
        },
        js: {
            type: "gpii.express.router.static",
            options: {
                path:    "/src",
                content: srcDir
            }
        },
        modules: {
            type: "gpii.express.router.static",
            options: {
                path:    "/modules",
                content: modulesDir
            }
        },
        content: {
            type: "gpii.express.router.static",
            options: {
                path:    "/content",
                content: contentDir
            }
        },
        handlebars: {
            type: "gpii.express.hb"
        },
        error: {
            type: "gpii.templates.tests.router.error"
        },
        errorJsonString: {
            type: "gpii.templates.tests.router.error",
            options: {
                path: "/errorJsonString",
                body: JSON.stringify({ok: false, message: "There was a problem.  I'm telling you about it using a stringified JSON response.  Hope that's OK with you."})
            }
        },
        errorString: {
            type: "gpii.templates.tests.router.error",
            options: {
                path: "/errorString",
                body: "There was a problem.  I'm telling you about it with a string response, hopefully this doesn't cause another problem."
            }
        }
    }
});