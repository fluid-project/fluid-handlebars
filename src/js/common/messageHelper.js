/*

    A handlebars helper that interpolates variable content into i18n/l10n message strings and produces string output.

    See the docs for details: https://github.com/GPII/gpii-handlebars/blob/master/docs/i18n.md

 */
/* eslint-env node */
"use strict";
var fluid  = fluid || require("infusion");
var gpii   = fluid.registerNamespace("gpii");

fluid.registerNamespace("gpii.handlebars.helper.messageHelper");

gpii.handlebars.helper.messageHelper.getHelper = function (that) {
    return function (messageKey, dataOrRootContext, rootContext) {
        if (arguments.length < 2) {
            fluid.fail("You must call the 'messageHelper' helper with at least a message key.");
        }
        else {
            // Pick up the message bundles from the root context, which is always the last argument.
            // var messages = fluid.get(rootContext || dataOrRootContext, "data.root.messages");

            // SGITHENS: In progress, reworking some wonkyness. The options that get passed in from the
            // helper invocation don't quite appear to be what's needed.  Also, when serverMessageAware
            // creates the message cache, the messages are being put on a modelComponent, however in
            // here it appears that they are being looked up as options on a grade.  Working on moving
            // them over to use a model in both cases, and then will fixup the ioc wiring.
            var serverAware = fluid.queryIoCSelector(fluid.rootComponent, "gpii.handlebars.renderer.serverAware")[0];
            var messages = fluid.get(serverAware, "model.messages");
            // If we have a third argument, then the second argument is our "data".  Otherwise, we use the root context (equivalent to passing "." as the variable).
            var data = rootContext ? dataOrRootContext : fluid.get(dataOrRootContext, "data.root");
            var resolver = fluid.messageResolver({ messageBase: messages });
            return resolver.resolve(messageKey, {});
        }
    };
};

fluid.defaults("gpii.handlebars.helper.messageHelper", {
    gradeNames: ["gpii.handlebars.helper"],
    helperName: "messageHelper",
    invokers: {
        "getHelper": {
            "funcName": "gpii.handlebars.helper.messageHelper.getHelper",
            "args":     ["{that}"]
        }
    }
});
