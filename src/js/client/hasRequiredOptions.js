// Grade to add checking for required options on startup.
// TODO: Migrate to using JSON Schema validation to handle this once this is resolved: https://issues.gpii.net/browse/GPII-1176
/* global jQuery, fluid */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");

    // A static function to check for the existing of required options data and fail, typically called on startup.
    //
    // `that.options.requiredFields` is expected to be an object whose keys represent relative paths to definitions, as in:
    //
    // requiredFields: {
    //   "path.relative.to.that.options": true
    // }
    //
    gpii.checkRequiredOptions = function (options, requiredFields, location, suffix) {
        var errors = [];

        fluid.each(requiredFields, function (value, path) {
            var requiredValue = fluid.get(options, path);
            if (requiredValue === undefined) {
                errors.push("You have not supplied the required option '" + path + "' to a '" + location + "' " + suffix + "...");
            }
        });

        if (errors.length > 0) {
            fluid.fail(errors);
        }
    };

    fluid.defaults("gpii.hasRequiredOptions", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            "onCreate.checkRequiredOptions": {
                funcName: "gpii.checkRequiredOptions",
                args:     ["{that}.options", "{that}.options.requiredFields", "{arguments}.0", "component"]
            }
        }
    });
})(jQuery);