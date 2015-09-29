// # What is this?
//
// The `initBlock` Handlebars helper constructs a client side component given a list of grades, including all
// wiring required to ensure that:
//
//   1. Only one renderer is created and used in all child components
//   2. Child components are only created once templates have been loaded.
//
// The end result is a nested structure, starting with a `pageComponent` variable that has a global renderer.  This
// component has a `requireRenderer` child component, which is created only when the templates are available, and holds
// a `pageComponent` component constructed from the grades passed to the helper (see below).
//
// # Usage
//
// The markup required to use this in a Handlebars template is something like:
//
//   {{{initblock "grade1", "grade2", "grade3"}}}
//
// As with `gradeNames` in general, grades that appear earlier in the list of arguments have the most precedence.
// If you are working with grades that override invokers or other options, you should put the most basic grades at the
// end of your list of arguments, and any grades that override or add functionality further to the left.  If all three
// of the grades in this example have an invoker with the same name, the invoker defined in `grade1` would be called.
//
// Please note, in the example above that the triple braces are required in order to prevent Handlebars from escaping
// the generated code and presenting it as text.  Note also that this helper is only meant to be used on the server
// side, and will not work at all with the client side Handlebars infrastructure.
//
// # Adding context data to the generated component's options
//
// As this is a server-side component, it may be aware of things that you'd like to expose as part of your options.
// The process of doing this is two-fold:
//
// 1.  When configuring your `gpii.express.dispatcher` grade, you should configure it to expose the data you're
//     interested in to the Handlebars context.
//
// 2.  When configuring the `initBlock` component (typically found as a child component of a `gpii.express.hb`
//     instance), you can add rules in `options.contextToOptionsRules` to control what (if any) parts of the Handlebars
//     context are added to the generated component's options.  These rules might look something like:
//
//     contextToOptionsRules: {
//       req:  "req",     // Pass the request object to the component's options, if available.
//       model: {
//         user: "user" // There are so many components that will listen for a user that we pass it by default if it's available.
//       }
//     }
//
// These will be merged with any existing options you have added for the nested pageComponent component in
// `options.baseOptions`, and will take precedence over any information found there.
//
// The generated code will only work if you have included Fluid itself and any client-side code your grades depend on.
// At a minimum, you will need to include the following client-side scripts from this package:
//
// * src/js/client/hasRequiredOptions.js
// * src/js/client/ajaxCapable.js
// * src/js/client/binder.js
// * src/js/client/md-client.js
// * src/js/client/renderer.js
// * src/js/client/templateManager.js
// * src/js/client/templateAware.js
//
// Most of the examples in this package make use of one or more of the following grades as well:
//
// * src/js/client/templateFormControl.js
// * src/js/client/templateMessage.js
// * src/js/client/templateRequestAndRender.js
//
// For more details, review each of those and the tests in this package.
//
"use strict";
var fluid  = fluid || require("infusion");
var gpii   = fluid.registerNamespace("gpii");
var jQuery = fluid.registerNamespace("jQuery");

fluid.registerNamespace("gpii.templates.helper.initBlock");

gpii.templates.helper.initBlock.getHelper = function (that) {
    return that.generateInitBlock;
};

gpii.templates.helper.initBlock.generateInitBlock = function (that, args) {
    // Guard against being handed an `Arguments` object instead of an array.
    args = fluid.makeArray(args);

    // In addition to the arguments we have passed, Handlebars gives us a final argument of its own construction.
    // This object contains the context data exposed to Handlebars.  We transform the data included in the context using
    // the rules outlined in `options.contextToModelRules` and use that as the generated component's model.
    var handlebarsContextData = args.slice(-1)[0].data.root;
    var generatedOptions      = fluid.model.transformWithRules(handlebarsContextData, that.options.contextToOptionsRules);

    // Everything except for the final argument is a gradeName that we can work with.
    var rawGradeNames = args.slice(0, -1);

    // To ensure the same order of precedence as gradeNames, the last argument are used as the `type`, and any earlier
    // options are used as the `gradeNames`.
    var type       = rawGradeNames.slice(-1)[0]; // The first grade, which we will use as the `type` of the component.
    var gradeNames = rawGradeNames.slice(0, -1);

    if (!type) {
        fluid.fail("You must call the 'initBlock' helper with one or more grade names.");
    }
    else {
        var options                       = fluid.copy(that.options.baseOptions);
        var pageComponent                 = options.components.requireRenderer.options.components.pageComponent;
        pageComponent.type                = type;
        pageComponent.options.gradeNames  = gradeNames;

        // Merge the generate component options into the current hierarchy
        jQuery.extend(pageComponent.options, generatedOptions);

        // TODO:  This may prevent instantiating multiple components in a single page.  Review this practice as needed.
        var payload = ["<script type=\"text/javascript\">", "var gpii=fluid.registerNamespace(\"gpii\");", "var pageComponent = " + that.options.baseGradeName, "(" + JSON.stringify(options, null, 2) + ");", "</script>"].join("\n");

        return payload;
    }
};

fluid.defaults("gpii.templates.helper.initBlock", {
    gradeNames: ["gpii.templates.helper"],
    mergePolicy: {
        "baseOptions": "noexpand,nomerge"
    },
    contextToOptionsRules: {},
    baseGradeName: "gpii.templates.templateManager",
    baseOptions: {
        components: {
            requireRenderer: {
                options: {
                    components: {
                        pageComponent: {
                            container:  "body",
                            options:    {
                            }
                        }
                    }
                }
            }
        }
    },
    helperName: "initBlock",
    invokers: {
        "getHelper": {
            "funcName": "gpii.templates.helper.initBlock.getHelper",
            "args":     ["{that}"]
        },
        "generateInitBlock": {
            "funcName": "gpii.templates.helper.initBlock.generateInitBlock",
            "args":     ["{that}", "{arguments}"]
        }
    }
});
