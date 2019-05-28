// A client-side module that:
//
// 1. Instantiates a `gpii.handlebars.renderer`.
// 2. Distributes its renderer to any child grades that extend the `templateAware` grade.
// 3. Makes any child grades that extend the `templateAware` grade delay their creation until templates are loaded.
//
// For this to work as expected and for components to be created in the right order, you should only add components
// to `components.requireRenderer`.
//
/* global fluid, jQuery */
(function (fluid) {
    "use strict";
    fluid.defaults("gpii.handlebars.templateManager", {
        gradeNames: ["fluid.component"],
        components: {
            renderer: {
                // TODO sgithens This needs to be updated depending on the app from serverAware to
                // serverMessageAware dynamically.
                type: "gpii.handlebars.renderer.serverMessageAware"
            },
            // All components that require a renderer should be added as children of the `requireRenderer` component
            // to ensure that they are created once the renderer is available.
            requireRenderer: {
                createOnEvent: "{renderer}.events.onAllResourcesLoaded",
                type: "fluid.component"
            }
        },
        distributeOptions: [
            // Any child components of this one should use our renderer
            {
                record: "{gpii.handlebars.templateManager}.renderer",
                target: "{that templateAware}.options.components.renderer"
            },
            // Any child `templateAware` components of this one should be "born ready" to render.
            {
                record: "gpii.handlebars.templateAware.bornReady",
                target: "{that templateAware}.options.gradeNames"
            }
        ]
    });
})(fluid);
