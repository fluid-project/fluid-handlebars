// Throw an error message to test client-side error handling.
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.templates.tests.router.error");

gpii.templates.tests.router.error.getRouter = function (that) {
    return function (req, res) {
        res.status(that.options.statusCode).send(that.options.body);
    };
};

fluid.defaults("gpii.templates.tests.router.error", {
    gradeNames: ["gpii.express.router", "autoInit"],
    method:     "get",
    path:       "/error",
    statusCode: 500,
    body:       { message: "Something has gone horribly wrong as planned."},
    invokers: {
        "getRouter": {
            funcName: "gpii.templates.tests.router.error.getRouter",
            args: ["{that}"]
        }
    }
});