/*

  A base grade for components that make use of the Handlebars client to render their content.  To use this in a
  component, you will need to:

  1. Pass in a `templateUrl` option that points to a REST interface from which the template content can be retrieved.
     See the `inline` server-side component for an example of the output required.

  2. Replace the `renderInitialMarkup` invoker with your own implementation, that should replace selected view content
     using the `templates` component.  Replace this with an empty function if you want to disable the initial render
     once template content is loaded.

     This grade provides a convenience invoker that you can use when defining your `renderMarkup` controller, as in:

     renderInitialMarkup: {
        func: "{that}.renderMarkup",
        args: [
          "{that}",
          "{that}.options.selectors.selector",
          "{that}.options.templates.templates",
          "{that}.model",
          "appendTo"
        ]
      }

  For an example of using this in depth, check out the provided `templateFormControl` grade or the client side tests.
 */
/* global fluid, jQuery */
(function () {
    "use strict";
    var gpii  = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.templates.templateAware");

    // A convenience function that can be used to more easily define `renderInitialMarkup` invokers (see example above).
    gpii.templates.templateAware.renderMarkup = function (that, selector, template, data, manipulator) {
        manipulator = manipulator ? manipulator : "html";
        var element = that.locate(selector);
        var renderer = that.getRenderer();
        if (renderer) {
            renderer[manipulator](element, template, data);
            that.events.onMarkupRendered.fire(that);
        }
        else {
            fluid.fail("I cannot render content without a renderer.");
        }
    };

    gpii.templates.templateAware.refreshDom = function (that) {
        // Adapted from: https://github.com/fluid-project/infusion/blob/master/src/framework/preferences/js/Panels.js#L147
        var userJQuery = that.container.constructor;
        that.container = userJQuery(that.container.selector, that.container.context);
        fluid.initDomBinder(that, that.options.selectors);
        that.events.onDomBind.fire(that);
    };

    fluid.defaults("gpii.templates.templateAware", {
        gradeNames: ["gpii.hasRequiredOptions", "fluid.viewComponent"],
        requiredOptions: {
            templates:           true,
            "templates.initial": true,
            "templates.error":   true,
            "templates.success": true
        },
        events: {
            refresh: null,
            onMarkupRendered: null,
            onDomBind: null
        },
        listeners: {
            "refresh.renderMarkup": {
                func: "{that}.renderInitialMarkup"
            },
            "onDomBind.applyBinding": {
                funcName: "gpii.templates.binder.applyBinding",
                args:     ["{that}"]
            },
            "onMarkupRendered.refreshDom": {
                funcName: "gpii.templates.templateAware.refreshDom",
                args:     ["{that}"]
            }
        },
        invokers: {
            // TODO:  Review why this claims not to be overriden.
            //renderInitialMarkup: {
            //    funcName: "fluid.notImplemented"
            //},
            renderMarkup: {
                funcName: "gpii.templates.templateAware.renderMarkup",
                args:     ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
            },
            getRenderer: {
                funcName: "fluid.notImplemented"
            }
        },
        components: {
            rendererComponent: {
                type:     "gpii.templates.renderer",
                priority: "first"
            }
        }
    });

    // A convenience grade which configured a `templateAware` component to render on startup.
    fluid.defaults("gpii.templates.templateAware.bornReady", {
        listeners: {
            "onCreate.renderMarkup": {
                func: "{that}.renderInitialMarkup"
            }
        }
    });

    fluid.registerNamespace("gpii.templates.templateAware.serverAware");

    gpii.templates.templateAware.serverAware.getRenderer = function (that) {
        return that.rendererComponent;
    };

    fluid.defaults("gpii.templates.templateAware.serverAware", {
        gradeNames: ["gpii.templates.templateAware"],
        components: {
            rendererComponent: {
                type: "gpii.templates.renderer.serverAware",
                options: {
                    listeners: {
                        "onTemplatesLoaded.renderMarkup": {
                            func: "{gpii.templates.templateAware.serverAware}.renderInitialMarkup"
                        }
                    }
                }
            }
        },
        invokers: {
            getRenderer: {
                funcName: "gpii.templates.templateAware.serverAware.getRenderer",
                args:    ["{gpii.templates.templateAware.serverAware}"]
            }
        }
    });
})(jQuery);