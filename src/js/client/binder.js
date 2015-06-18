// Add persistent bindings between a selector and a model value.  Changes are propagated between the two.
//
// To use this, you should add have an `options.bindings` element to your component.  It should look something like:
//
// bindings: {
//   "key": {
//     selector: "selector1",
//     path:     "path1"
//   },
//   "selector2": "path2"
// }
//
// There are two ways of specifying bindings.  The "long form" has named keys (as in the first example above) and
// supports the following options:
//
// * selector:    A valid selector for your component.
//                Must be able to be resolved using that.locate(selector)
//
// * path:        A valid path for the model variable whose value will be watched.
//                Must be able to be resolved using fluid.get(path)
//
// The "short form" uses the selector as the key, and the path as a string value (as in the second example above).
//
// To make use of either form, you will need to start by sourcing this file after all fluid sources.
//
// Then, in your component, you will need a valid selector, as in:
//
//  selectors: {
//      "input":    ".ptd-search-input"
//  }
//
// You will also need a valid model path, as in:
//
//  model: {
//      input:  ""
//  }
//
// Finally, you will need to invoke the binding applier where it makes sense, for example in response to an event.
// Here's an example that binds to the "onCreate" event:
//
//  listeners: {
//      onCreate: {
//        "funcName": "gpii.templates.binder.applyBinding",
//        "args":     "{that}"
//      }
//  }
//
// Once you have done all this, model changes should be passed to form controls and vice versa.
//
// Note that if you reload markup or otherwise generate new markup, you will need to reapply the set of bindings.
// The `templateAware` grade included with this package takes care of that for you by calling `fluid.initDomBinder`
// and then running `applyBinding` once the `onDomBind` event is fired.  See that component for a working example.
//
// This code was originally written by Antranig Basman <amb26@ponder.org.uk> and with his advice was updated and
// extended by Tony Atkins <tony@raisingthefloor.org>.
//
/* global fluid, jQuery */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.templates.binder");

    // The main function to create bindings between markup and model elements.  See above for usage details.
    gpii.templates.binder.applyBinding = function (that) {
        var bindings = that.options.bindings;
        fluid.each(bindings, function (value, key) {
            var path     = typeof value === "string" ? value : value.path;
            var selector = typeof value === "string" ? key : value.selector;
            var element = that.locate(selector);

            // Update the model when the form changes
            element.change(function () {
                fluid.log("Changing model based on element update.");

                var elementValue = fluid.value(element);
                that.applier.change(path, elementValue);
            });

            // Update the form elements when the model changes
            that.applier.modelChanged.addListener(path, function (change) {
                fluid.log("Changing value based on model update.");

                // This syntax is required until Fluid is updated per the following pull request:
                //
                //   https://github.com/fluid-project/infusion/pull/591
                //
                // For a description of a similar problem caused by the same behavior, see:
                //
                //   https://issues.fluidproject.org/browse/FLUID-4739
                //
                var value = change[path] ? change[path] : change;
                fluid.value(element, value);
            });

            // If we have model data initially, update the form.  Model values win out over markup.
            var initialModelValue = fluid.get(that.model, path);
            if (initialModelValue) {
                fluid.value(element, initialModelValue);
            }
            // If we have no model data, but there are defaults in the markup, using them to update the model.
            else {
                var initialFormValue = fluid.value(element);
                if (initialFormValue) {
                    that.applier.change(path, initialFormValue);
                }
            }
        });
    };
})(jQuery);


