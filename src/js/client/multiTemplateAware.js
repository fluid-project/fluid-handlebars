/*

 A base grade for a templateAware component that contains other templateAware components.  This grade's sole job is to
 ensure that a complex panel uses a single template renderer instance.

 For an example of using this in depth, check out the provided `templateFormControl` grade or the client side tests.

 */
/* global fluid, jQuery */
(function () {
    "use strict";
    fluid.registerNamespace("gpii");

    fluid.defaults("gpii.templates.hb.client.multiTemplateAware.hasSingularRenderer", {
        components: {
            renderer: "{rendererHolder}.renderer"
        },
        //TODO: Review with Antranig
        //listeners: {
        //    // Ordinarily a component renders when the template renderer is available.  Subcomponents can assume that
        //    // Their parent has already taken care of this and render on creation.
        //    "onCreate.render": {
        //        listeners: {
        //            func: "{that}.renderInitialMarkup"
        //        }
        //    }
        //}
    });

    fluid.defaults("gpii.templates.hb.client.multiTemplateAware.distributor", {
        distributeOptions: [
            {
                // Any child components of this one should use our renderer.
                record: "gpii.templates.hb.client.multiTemplateAware.hasSingularRenderer",
                target: "{that templateAware}.options.gradeNames"
            }
        ]
    });

    fluid.defaults("gpii.templates.hb.client.multiTemplateAware.rendererHolder", {
        gradeNames: ["gpii.templates.hb.client.templateAware", "autoInit"]
    });

    fluid.defaults("gpii.templates.hb.client.multiTemplateAware", {
        gradeNames: ["gpii.templates.hb.client.multiTemplateAware.rendererHolder", "gpii.templates.hb.client.multiTemplateAware.distributor", "autoInit"]
    });

})(jQuery);