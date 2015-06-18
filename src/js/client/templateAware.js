/*

  A base grade for components that make use of the Handlebars client to render their content.  To use this in a
  component, you will need to:

  1. Pass in a `templateUrl` option that points to a REST interface from which the template content can be retrieved.
     See the `inline` server-side component for an example of the output required.

  2. Replace the `renderInitialMarkup` invoker with your own implementation, that should replace selected view content
     using the `templates` component.  Replace this with an empty function if you want to disable the initial render
     once template content is loaded.

     This grade provides a convenience function that you can use when defining your `renderMarkup` controller, as in:

     renderInitialMarkup: {
        funcName: "gpii.templates.hb.client.templateAware.renderMarkup",
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
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.templates.hb.client.templateAware");

    gpii.templates.hb.client.templateAware.checkRequirements = function (that) {
        if (!that.options.templateUrl) {
            fluid.fail("You must supply a template URL in order to use this component.");
        }
    };

    // A convenience function that can be used to more easily define `renderInitialMarkup` invokers (see example above).
    gpii.templates.hb.client.templateAware.renderMarkup = function (that, selector, template, data, manipulator) {
        manipulator = manipulator ? manipulator : "html";
        var element = that.locate(selector);
        that.renderer[manipulator](element, template, data);
        that.events.onMarkupRendered.fire(that);
    };

    // When overriding this, you should fire an `onMarkupRendered` event to ensure that bindings can be applied.
    gpii.templates.hb.client.templateAware.noRenderFunctionDefined = function () {
        fluid.fail("You are expected to define a renderInitialMarkup invoker when implementing a templateAware component.");
    };

    gpii.templates.hb.client.templateAware.refreshDom = function (that) {
        // Adapted from: https://github.com/fluid-project/infusion/blob/master/src/framework/preferences/js/Panels.js#L147
        var userJQuery = that.container.constructor;
        that.container = userJQuery(that.container.selector, that.container.context);
        fluid.initDomBinder(that, that.options.selectors);
        that.events.onDomBind.fire(that);
    };

    fluid.defaults("gpii.templates.hb.client.templateAware", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        templateUrl: "/hbs",
        components: {
            renderer: {
                type: "gpii.templates.hb.client",
                options: {
                    templateUrl: "{templateAware}.options.templateUrl",
                    listeners: {
                        "onTemplatesLoaded.renderMarkup": {
                            func: "{templateAware}.renderInitialMarkup"
                        }
                    }
                }
            }
        },
        events: {
            refresh: null,
            onMarkupRendered: null,
            onDomBind: null
        },
        listeners: {
            "onCreate.checkRequirements": {
                funcName: "gpii.templates.hb.client.templateAware.checkRequirements",
                args:     ["{that}"]
            },
            "refresh.renderMarkup": {
                func: "{that}.renderInitialMarkup"
            },
            "onDomBind.applyBinding": {
                funcName: "gpii.templates.binder.applyBinding",
                args:     ["{that}"]
            },
            "onMarkupRendered.refreshDom": {
                funcName: "gpii.templates.hb.client.templateAware.refreshDom",
                args:     ["{that}"]
            }
        },
        invokers: {
            renderInitialMarkup: {
                funcName: "gpii.templates.hb.client.templateAware.noRenderFunctionDefined"
            },
            renderMarkup: {
                funcName: "gpii.templates.hb.client.templateAware.renderMarkup",
                args:     ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            }
        }
    });
})(jQuery);