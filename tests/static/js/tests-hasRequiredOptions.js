"use strict";
// Test the "has required options" grade.
//
// This is a test component that is meant to be included in a client-side document.
//
/* global fluid */
/* eslint-env node */
fluid.defaults("gpii.tests.handlebars.hasRequiredOptions", {
    gradeNames: ["gpii.hasRequiredOptions"],
    template:   "common-success",
    requiredFields: {
        beer: true,
        skittles: true
    }
});
