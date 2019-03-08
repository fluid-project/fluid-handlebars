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
          "{that}.options.templateKeys.templateKey",
          "{that}.model",
          "appendTo"
        ]
      }

  For an example of using this in depth, check out the provided `templateFormControl` grade or the client side tests.
 */
/* global fluid */
/* eslint-env browser */
(function (fluid) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.handlebars.templateAware");

    // A convenience function that can be used to more easily define `renderInitialMarkup` invokers (see example above).
    gpii.handlebars.templateAware.renderMarkup = function (that, renderer, selector, template, data, manipulator) {
        manipulator = manipulator ? manipulator : "html";
        var element = that.locate(selector);
        if (renderer) {
            renderer[manipulator](element, template, data);
            that.events.onMarkupRendered.fire(that);
        }
        else {
            fluid.fail("I cannot render content without a renderer.");
        }
    };

    gpii.handlebars.templateAware.refreshDom = function (that) {
        // Adapted from: https://github.com/fluid-project/infusion/blob/master/src/framework/preferences/js/Panels.js#L147
        var userJQuery = that.container.constructor;
        that.container = userJQuery(that.container.selector, that.container.context);
        // fluid.initDomBinder(that, that.options.selectors);
        that.dom.clear();
        that.events.onDomChange.fire(that);
    };

    fluid.defaults("gpii.handlebars.templateAware", {
        gradeNames: ["fluid.viewComponent", "gpii.binder.bindOnDomChange"],
        events: {
            refresh: null,
            onMarkupRendered: null
        },
        listeners: {
            "refresh.renderMarkup": {
                func: "{that}.renderInitialMarkup"
            },
            "onMarkupRendered.refreshDom": {
                funcName: "gpii.handlebars.templateAware.refreshDom",
                args:     ["{that}"]
            }
        },
        invokers: {
            renderInitialMarkup: {
                funcName: "fluid.notImplemented"
            },
            renderMarkup: {
                funcName: "gpii.handlebars.templateAware.renderMarkup",
                args:     ["{that}", "{renderer}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"] // renderer, selector, template, data, manipulator
            }
        }
    });

    // A convenience grade which configures a `templateAware` component to render on startup.
    fluid.defaults("gpii.handlebars.templateAware.bornReady", {
        listeners: {
            "onCreate.renderMarkup": {
                func: "{that}.renderInitialMarkup"
            }
        }
    });

    fluid.defaults("gpii.handlebars.templateAware.standalone", {
        gradeNames: ["gpii.handlebars.templateAware"],
        requiredOptions: {
            templates: true
        },
        model: {
            templates: "{that}.options.templates"
        },
        mergePolicy: {
            "templates.layouts":  "noexpand",
            "templates.pages":    "noexpand",
            "templates.partials": "noexpand"
        },
        distributeOptions: {
            source: "{that}.options.templates",
            target: "{that > renderer}.options.templates"
        },
        components: {
            renderer: {
                type: "gpii.handlebars.renderer.standalone",
                options: {
                    model: {
                        templates: "{gpii.handlebars.templateAware.standalone}.model.templates"
                    }
                }
            }
        },
        listeners: {
            "onCreate.renderMarkup": {
                func: "{that}.renderInitialMarkup"
            }
        }
    });

    fluid.defaults("gpii.handlebars.templateAware.serverAware", {
        gradeNames: ["gpii.handlebars.templateAware"],
        components: {
            renderer: {
                type: "gpii.handlebars.renderer.serverAware",
                options: {
                    listeners: {
                        "onAllResourcesLoaded.renderMarkup": {
                            func: "{gpii.handlebars.templateAware.serverAware}.renderInitialMarkup"
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("gpii.handlebars.templateAware.serverMessageAware", {
        gradeNames: ["gpii.handlebars.templateAware"],
        components: {
            renderer: {
                type: "gpii.handlebars.renderer.serverMessageAware",
                options: {
                    listeners: {
                        "onAllResourcesLoaded.renderMarkup": {
                            func: "{gpii.handlebars.templateAware.serverMessageAware}.renderInitialMarkup"
                        }
                    }
                }
            }
        }
    });
})(fluid);
