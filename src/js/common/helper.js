"use strict";
// Base gradeName for handlebars "helper" modules, which can be used on both the client and server side handlebars stacks.
var fluid = fluid || require("infusion");
fluid.registerNamespace("gpii.templates.helper");

// Each "helper" module is expected to replace the `getHelper` invoker with an invoker that returns a helper function, something like the following:
//
//your.namespace.moduleName.exampleFunction = function(that){
//    return function(arg1, arg2) {
//        // The two argument variations have the "options" object as the second argument.  one-argument variations have it as the first.
//        var options = arg2 ? arg2 : arg1;
//        return options.fn(this);
//    };
//};
//
// See http://handlebarsjs.com/block_helpers.html for an overview of the various types of helper functions that are possible.
//
// Once you have a module and function, you would then replace getHelper using an invoker definition like:
//
//     invokers: {
//      "getHelper": {
//          "funcName": "your.namespace.moduleName.exampleFunction",
//          "args":     ["{that}"]
//      }
//    }

fluid.defaults("gpii.templates.helper", {
    gradeNames: ["fluid.eventedComponent", "fluid.modelRelayComponent", "gpii.hasRequiredOptions", "autoInit"],
    requiredOptions: {
        helperName: true
    },
    invokers: {
        getHelper: {
            funcName: "fluid.fail",
            args:     ["You must implement getHelper in your grade before it will function properly as a helper."]
        }
    }
});