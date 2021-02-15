/* eslint-env node */
"use strict";
var fluid = require("infusion");

fluid.defaults("fluid.test.handlebars.request", {
    gradeNames: ["kettle.test.request.http"],
    port:       "{testEnvironment}.options.port",
    url: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: [
                "%baseUrl%endpoint",
                {
                    baseUrl: "{fluid.test.express.testEnvironment}.options.baseUrl",
                    endpoint: "{that}.options.endpoint"
                }
            ]
        }
    },
    endpoint: ""
});

fluid.defaults("fluid.test.handlebars.environment", {
    gradeNames: ["fluid.test.express.testEnvironment"],
    port: 6984,
    path: "",
    url: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["http://localhost:%port/%path", { port: "{that}.options.port", path: "{that}.options.path"}]
        }
    },
    components: {
        express: {
            type: "fluid.test.handlebars.harness"
        }
    }
});
