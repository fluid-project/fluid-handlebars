// A client-side module that:
//
// 1. Instantiates a `gpii.templates.renderer`.
// 2. Distributes its renderer to any child grades that extend the `templateAware` grade.
// 3. Makes any child grades that extend the `templateAware` grade delay their creation until templates are loaded.
//
// For this to work as expected and for components to be created in the right order, you should only add components
// to `components.requireRenderer`.
//
/* global fluid, jQuery */
(function () {
    "use strict";
    var gpii  = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.templates.templateManager");

    gpii.templates.templateManager.getTemplateManagerRenderer = function (that) {
        return that.rendererComponent;
    };

    fluid.defaults("gpii.templates.templateManager", {
        gradeNames: ["fluid.component"],
        components: {
            rendererComponent: {
                type: "gpii.templates.renderer.serverAware",
                priority: "first"
            },
            // All components that require a renderer should be added as children of the `requireRenderer` component
            // to ensure that they are created once the renderer is available.
            requireRenderer: {
                createOnEvent: "{rendererComponent}.events.onTemplatesLoaded",
                type: "fluid.component"
            }
        },
        distributeOptions: [
            // Any child components of this one should use our renderer
            {
                source: "{that}.options.invokers.getRenderer",
                target: "{that templateAware}.options.invokers.getRenderer"
            },
            // Any child `templateAware` components of this one should be "born ready" to render.
            {
                record: "gpii.templates.templateAware.bornReady",
                target: "{that templateAware}.options.gradeNames"
            }
        ],
        invokers: {
            getRenderer: {
                funcName: "gpii.templates.templateManager.getTemplateManagerRenderer",
                args:     ["{gpii.templates.templateManager}"]
            }
        }
    });
})(jQuery);


