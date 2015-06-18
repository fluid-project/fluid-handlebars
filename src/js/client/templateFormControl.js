/*

  A component to standardize handling of "simple" form data submitted via AJAX.  This component:

  1.  Performs an initial render of the component using the template specified in `options.templates.initial`
  2.  Binds a form submission that sends the `model` data using the options specified in `options.ajax`
  3.  If the AJAX request returns an error or the result contains a "falsy" `ok` variable:
      a)  Any previous "success" messages are cleared.
      b)  the error is transformed using the rules found in `options.rules.error`
      c)  the results are passed along to the `error` subcomponent for display.
  4.  If the AJAX request is successful:
      a)  Any previous "error" messages are cleared.
      b)  The results are transformed using the rules found in `options.rules.success` and passed to the `success` subcomponent for display.
      c)  The results are transformed using the rules found in `options.rules.model`, and applied to the model using the change applier.

 */
/* global fluid, jQuery */
(function ($) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.templates.hb.client.templateFormControl");


    // TODO: Replace this with JSON Schema validation: https://issues.gpii.net/browse/GPII-1176
    gpii.templates.hb.client.templateFormControl.checkRequirements = function (that) {
        var errors = [];

        if (!that.options.templates || !that.options.templates.initial || !that.options.templates.error || !that.options.templates.success) {
            errors.push("You have not configured any templates for use with this component.");
        }

        else if (!that.options.ajaxUrl) {
            errors.push("Your AJAX options do not include a URL.  The AJAX request will not be able to complete as expected.");
        }

        if (!that.options.rules || !that.options.rules.error || !that.options.rules.success || !that.options.rules.submission) {
            errors.push("You have not configured the required rules regarding how to handle AJAX responses.");
        }

        if (errors.length > 0) {
            fluid.fail(errors);
        }
    };

    gpii.templates.hb.client.templateFormControl.submitForm = function (that, event) {
        if (event) {
            event.preventDefault();
        }

        var options = fluid.copy(that.options.ajaxOptions);

        var transformedModel = fluid.model.transformWithRules(that.model, that.options.rules.submission);

        if (options.json) {
            options.contentType = "application/json";
        }

        options.data = options.json ? JSON.stringify(transformedModel) : transformedModel;
        $.ajax(options);
    };

    gpii.templates.hb.client.templateFormControl.handleSuccess = function (that, data) {
        // We assume that we are working with a success unless we have explicit data that suggests otherwise.
        var okData = fluid.model.transformWithRules(data, that.options.rules.ok);
        if (okData.ok === undefined || okData.ok === null || okData.ok) {
            var transformedData = fluid.model.transformWithRules(data, that.options.rules.model);
            // The transformed result is used to update the component's `model`.
            Object.keys(transformedData).forEach(function (key) {
                that.applier.change(key, transformedData[key]);
            });

            // Clear out any "error" messages
            that.error.applier.change("message", null);

            // Pass along any "success" message
            var successData = fluid.model.transformWithRules(data, that.options.rules.success);
            that.success.applier.change("message", successData);

            // Optionally hide the original content.
            if (that.options.hideOnSuccess) {
                that.locate("form").hide();
            }
        }
        // If the response is not OK, pass it along to be handled as an error instead.
        // NOTE:  The error handling has its own rules for parsing the original response, so we must pass it along.
        else {
            gpii.templates.hb.client.templateFormControl.handleError(that, data);
        }
    };

    gpii.templates.hb.client.templateFormControl.handleError = function (that, data) {
        // Clear out any "success" messages.
        that.success.applier.change("message", null);

        // Display the updated error message.
        var errorData = fluid.model.transformWithRules(data, that.options.rules.error);
        that.error.applier.change("message", errorData);

        // Optionally hide the original content.
        if (that.options.hideOnError) {
            that.locate("form").hide();
        }
    };

    gpii.templates.hb.client.templateFormControl.handleKeyPress = function (that, event) {
        if (event.keyCode === 13) { // Enter
            gpii.templates.hb.client.submitForm(that, event);
        }
    };

    fluid.defaults("gpii.templates.hb.client.templateFormControl", {
        gradeNames:    ["gpii.templates.hb.client.multiTemplateAware", "autoInit"],
        hideOnSuccess: true, // Whether to hide our form if the results are successful
        ajaxOptions: {
            url:     "{that}.options.ajaxUrl",
            success: "{that}.handleSuccess",
            error:   "{that}.handleError"
        },
        // Rules to control what (if any) feedback from successful response is displayed.
        rules: {
            // Rules to control what (if any) part of the response is used to update the model.
            model:   {}, // Explicitly avoid model changes by default.

            // Rules to evaluate whether a response is successful
            ok: {
                "": "responseJSON" // By default, use the entire jQuery `jqXHR` object's JSON payload.
            },

            // Rules to control how a successful response is parsed for display on screen.
            success: {
                "": "responseJSON" // By default, use the entire jQuery `jqXHR` object's JSON payload.
            },

            // Rules to control how an error is parsed.
            error: {
                "": "responseJSON" // By default, use the entire jQuery `jqXHR` object's JSON payload.
            },

            // Rules to control how our model is parsed before submitting to `options.ajaxOptions.url`
            submission: {
                "": ""    // By default, pass the model with no alterations.
            }
        },
        components: {
            success: {
                type:     "gpii.templates.hb.client.templateMessage",
                createOnEvent: "{templateFormControl}.events.onMarkupRendered",
                container: "{templateFormControl}.dom.success",
                options: {
                    template: "{templateFormControl}.options.templates.success"
                }
            },
            error: {
                type:          "gpii.templates.hb.client.templateMessage",
                createOnEvent: "{templateFormControl}.events.onMarkupRendered",
                container:     "{templateFormControl}.dom.error",
                options: {
                    template: "{templateFormControl}.options.templates.error"
                }
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
                funcName: "gpii.templates.hb.client.templateAware.renderMarkup",
                args: ["{that}", "initial", "{that}.options.templates.initial", "{that}.model", "html"]
            },
            submitForm: {
                funcName: "gpii.templates.hb.client.templateFormControl.submitForm",
                args: ["{that}", "{arguments}.0"]
            },
            handleSuccess: {
                funcName: "gpii.templates.hb.client.templateFormControl.handleSuccess",
                args: ["{that}", "{arguments}.2"]  // We use the jqXHR object because it gives us fine control over text vs. JSON responses.
            },
            handleError: {
                funcName: "gpii.templates.hb.client.templateFormControl.handleError",
                args: ["{that}", "{arguments}.0"] // We use the jqXHR object because it gives us fine control over text vs. JSON responses.
            },
            handleKeyPress: {
                funcName: "gpii.templates.hb.client.templateFormControl.handleKeyPress",
                args: ["{that}", "{arguments}.0"]
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
            ]
        }
    });
})(jQuery);