/*

  A component to standardize handling of "simple" form data submitted via AJAX.  This component:

  1.  Performs an initial render of the component using the template specified in `options.templates.initial`
  2.  Binds a form submission that sends the `model` data formatted using `options.rules.request` using the options
      specified in `options.ajax`

  For more details on the request and response cycle, see the `templateRequestAndUpdate` grade.

 */
/* global fluid, jQuery */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.templates.templateFormControl");

    gpii.templates.templateFormControl.submitForm = function (that, event) {
        // We are handling this event and should prevent any further handling.
        if (event) { event.preventDefault(); }

        // Let the `ajaxCapable` grade handle the request and response.
        that.makeRequest();
    };

    gpii.templates.templateFormControl.handleKeyPress = function (that, event) {
        if (event.keyCode === 13) { // Enter
            that.submitForm(event);
        }
    };

    // Add support for hiding content if needed
    gpii.templates.templateFormControl.hideContentIfNeeded = function (that, success) {
        if ((success && that.options.hideOnSuccess) || (!success && that.options.hideOnError)) {
            var form = that.locate("form");
            form.hide();
        }
    };

    fluid.defaults("gpii.templates.templateFormControl", {
        gradeNames:    ["gpii.hasRequiredFields", "gpii.templates.ajaxCapable", "gpii.templates.templateAware"],
        hideOnSuccess: true,  // Whether to hide our form if the results are successful
        hideOnError:   false, // Whether to hide our form if the results are unsuccessful
        requiredFields: {
            templates:           true,
            "templates.initial": true,
            "templates.error":   true,
            "templates.success": true
        },
        model: {
        },
        distributeOptions: {
            source: "{that}.options.invokers.getRenderer",
            target: "{that templateAware}.options.invokers.getRenderer"
        },
        components: {
            success: {
                type:          "gpii.templates.templateMessage",
                createOnEvent: "{templateFormControl}.events.onMarkupRendered",
                container:     "{templateFormControl}.dom.success",
                options: {
                    template: "{templateFormControl}.options.templates.success",
                    model:  {
                        message: "{templateFormControl}.model.successMessage"
                    },
                    listeners: {
                        "onCreate.renderMarkup": {
                            func: "fluid.identity"
                        }
                    }
                }
            },
            error: {
                type:          "gpii.templates.templateMessage",
                createOnEvent: "{templateFormControl}.events.onMarkupRendered",
                container:     "{templateFormControl}.dom.error",
                options: {
                    template: "{templateFormControl}.options.templates.error",
                    model:  {
                        message: "{templateFormControl}.model.errorMessage"
                    },
                    listeners: {
                        "onCreate.renderMarkup": {
                            func: "fluid.identity"
                        }
                    }
                }
            }
        },
        // You are expected to add any data from the response you care about to the success and error rules.
        rules: {
            successResponseToModel: {
                successMessage: "responseJSON.message"
            },
            errorResponseToModel: {
                errorMessage:   "responseJSON.message"
            }
        },
        selectors: {
            initial: "",         // The container that will be updated with template content on startup and on a full refresh.
            form:    "form",     // The form element whose submission we will control
            error:   ".error",   // The error message controlled by our sub-component
            success: ".success", // The positive feedback controlled by our sub-component
            submit:  ".submit"   // Clicking or hitting enter on our submit button will launch our AJAX request
        },
        invokers: {
            renderInitialMarkup: {
                func: "{that}.renderMarkup",
                args: ["initial", "{that}.options.templates.initial", "{that}.model", "html"]
            },
            submitForm: {
                funcName: "gpii.templates.templateFormControl.submitForm",
                args:     ["{that}", "{arguments}.0"]
            },
            handleKeyPress: {
                funcName: "gpii.templates.templateFormControl.handleKeyPress",
                args:     ["{that}", "{arguments}.0"]
            },
            getRenderer: {
                funcName: "fluid.notImplemented"
            }
        },
        templates: {
            success: "common-success",
            error:   "common-error"
        },
        listeners: {
            "onMarkupRendered.wireControls": [
                {
                    "this": "{that}.dom.submit",
                    method: "on",
                    args:   ["keyup.handleKeyPress", "{that}.handleKeyPress"]
                },
                {
                    "this": "{that}.dom.submit",
                    method: "on",
                    args:   ["click.submitForm", "{that}.submitForm"]
                },
                {
                    "this": "{that}.dom.form",
                    method: "on",
                    args:   ["submit.submitForm", "{that}.submitForm"]
                }
            ],
            "requestReceived.hideContentIfNeeded": {
                funcName: "gpii.templates.templateFormControl.hideContentIfNeeded",
                args:     ["{that}", "{arguments}.1"]
            }
        }
    });
})(jQuery);