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
    fluid.defaults("gpii.templates.templateManager", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            renderer: {
                type: "gpii.templates.renderer.serverAware"
            },
            // All components that require a renderer should be added as children of the `requireRenderer` component
            // to ensure that they are created once the renderer is available.
            requireRenderer: {
                createOnEvent: "{renderer}.events.onTemplatesLoaded",
                type: "fluid.eventedComponent"
            }
        },
        distributeOptions: [
            // Any child components of this one should use our renderer
            {
                source: "{that}.renderer",
                target: "{that templateAware}.components.renderer"
            },
            // Any child `templateAware` components of this one should be "born ready" to render.
            {
                record: "gpii.templates.templateAware.bornReady",
                target: "{that templateAware}.options.gradeNames"
            }
        ]
    });
})(jQuery);


