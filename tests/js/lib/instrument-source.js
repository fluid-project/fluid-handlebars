/*

    Instrument our source including config files and templates for use in preparing browser coverage reports
    with gpii-webdriver/.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("gpii-testem");
require("../../../");

fluid.registerNamespace("gpii.tests.handlebars.instrumentation");

gpii.tests.handlebars.instrumentation.options = {
    sources:    ["./src/**/*.js", "./index.js"],
    excludes:   [],
    nonSources: [
        "./tests/**",
        "./Gruntfile.js",
        "./node_modules/gpii-binder/src/js/binder.js",
        "./node_modules/handlebars/dist/handlebars.js",
        "./node_modules/infusion/dist/infusion-all.js",
        "./node_modules/infusion/src/framework/core/js/DataBinding.js",
        "./node_modules/infusion/src/framework/core/js/Fluid.js",
        "./node_modules/infusion/src/framework/core/js/FluidDOMUtilities.js",
        "./node_modules/infusion/src/framework/core/js/FluidDocument.js",
        "./node_modules/infusion/src/framework/core/js/FluidIoC.js",
        "./node_modules/infusion/src/framework/core/js/FluidRequests.js",
        "./node_modules/infusion/src/framework/core/js/FluidView.js",
        "./node_modules/infusion/src/framework/core/js/MessageResolver.js",
        "./node_modules/infusion/src/framework/core/js/ModelTransformation.js",
        "./node_modules/infusion/src/framework/core/js/ModelTransformationTransforms.js",
        "./node_modules/infusion/src/framework/renderer/js/fluidParser.js",
        "./node_modules/infusion/src/framework/renderer/js/fluidRenderer.js",
        "./node_modules/infusion/src/lib/fastXmlPull/js/fastXmlPull.js",
        "./node_modules/infusion/src/lib/jquery/core/js/jquery.js",
        "./node_modules/markdown-it/dist/markdown-it.js",
        "./node_modules/gpii-binder/src/js/binder.js",
        "./node_modules/handlebars/dist/handlebars.js",
        "./node_modules/markdown-it/dist/markdown-it.js"
    ],
    istanbulOptions: {
        produceSourceMap: true,
        autoWrap: true
    }
};

gpii.testem.instrumenter.instrument("%gpii-handlebars", "%gpii-handlebars/instrumented", gpii.tests.handlebars.instrumentation.options);
