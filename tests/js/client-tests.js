"use strict";
// This is a test component that is meant to be included in a client-side document.
//
// To run these tests, you should look at zombie-tests.js, which will start the server and launch a headless browser.
//
/* global fluid, gpii, jqUnit */
fluid.registerNamespace("gpii.hb.clientTests");

// All tests should look for rendered content as well as variables, jsonify content, and markdown content
gpii.hb.clientTests.commonTests = function (that, element) {
    jqUnit.assertNotNull("The results should not be null.", element.html());

    var mdRegexp = /<p><em>this works<\/em><\/p>/i;
    jqUnit.assertNotNull("The results should contain transformed markdown.", element.html().match(mdRegexp));

    var variableRegexp = new RegExp(that.model.myvar);
    jqUnit.assertNotNull("The results should contain variable data.", element.html().match(variableRegexp));

    var jsonifyRegexp = new RegExp(JSON.stringify(that.model.json));
    jqUnit.assertNotNull("The results should contain jsonify data.", element.html().match(jsonifyRegexp));
};

gpii.hb.clientTests.runTests = function (that) {
    that.templates.loadPartials();

    jqUnit.asyncTest("Testing 'after' function...", function () {
        var element = that.locate("viewport-after");
        that.templates.after(element, that.model.templateName, that.model);

        jqUnit.start();
        jqUnit.assertTrue("The original element should contain the original text", element.html().indexOf("original content") !== -1);

        var elementAfter = element.next();
        jqUnit.assertTrue("The inserted element should contain new content", elementAfter.html().indexOf("from the template") !== -1);

        that.commonTests(elementAfter);
    });

    jqUnit.asyncTest("Testing 'append' function...", function () {
        var element = that.locate("viewport-append");
        that.templates.append(element, that.model.templateName, that.model);

        jqUnit.start();
        jqUnit.assertTrue("The updated element should contain the original text", element.html().indexOf("original content") !== -1);

        var appendRegexp = /^original content/;
        jqUnit.assertNotNull("The original text should be at the beginning of the results", element.html().match(appendRegexp));

        that.commonTests(element);
    });

    jqUnit.asyncTest("Testing 'before' function...", function () {
        var element = that.locate("viewport-before");
        that.templates.before(element, that.model.templateName, that.model);

        jqUnit.start();
        jqUnit.assertTrue("The original element should contain the original text", element.html().indexOf("original content") !== -1);

        var elementBefore = element.prev();
        jqUnit.assertTrue("The inserted element should contain new content", elementBefore.html().indexOf("from the template") !== -1);

        that.commonTests(elementBefore);
    });

    jqUnit.asyncTest("Testing 'html' function...", function () {
        var element = that.locate("viewport-html");
        that.templates.html(element, that.model.templateName, that.model);

        jqUnit.start();
        jqUnit.assertTrue("The updated element should not contain the original text", element.html().indexOf("original content") === -1);
        jqUnit.assertTrue("The updated element should contain new content", element.html().indexOf("from the template") !== -1);

        that.commonTests(element);
    });


    jqUnit.asyncTest("Testing 'prepend' function...", function () {
        var element = that.locate("viewport-prepend");
        that.templates.prepend(element, that.model.templateName, that.model);

        jqUnit.start();
        jqUnit.assertTrue("The updated element should contain the original text", element.html().indexOf("original content") !== -1);

        var prependRegexp = /original content$/;
        jqUnit.assertNotNull("The original text should be at the end of the results", element.html().match(prependRegexp));

        that.commonTests(element);
    });

    jqUnit.asyncTest("Testing 'replaceWith' function...", function () {
        var replaceWithElement = that.locate("viewport-replaceWith");
        that.templates.replaceWith(replaceWithElement, that.model.replaceWithTemplateName, that.model);

        var replacedElement    = that.locate("viewport-replaceWith");
        jqUnit.start();
        jqUnit.assertTrue("The updated element should not contain the original text", replacedElement.html().indexOf("original content") === -1);

        that.commonTests(replacedElement);
    });
};

fluid.defaults("gpii.hb.clientTests", {
    gradeNames: ["fluid.viewRelayComponent", "autoInit"],
    model: {
        "myvar":                   "modelvariable",
        "markdown":                "*this works*",
        "json":                    { "foo": "bar" },
        "templateName":            "template",
        "replaceWithTemplateName": "replace"
    },
    selectors: {
        "viewport-after":       ".viewport-after",
        "viewport-append":      ".viewport-append",
        "viewport-before":      ".viewport-before",
        "viewport-html":        ".viewport-html",
        "viewport-prepend":     ".viewport-prepend",
        "viewport-replaceWith": ".viewport-replaceWith"
    },
    components: {
        "templates": {
            "type": "gpii.templates.hb.client"
        }
    },
    invokers: {
        "commonTests": {
            "funcName": "gpii.hb.clientTests.commonTests",
            "args":     ["{that}", "{arguments}.0"]
        },
        "runTests": {
            "funcName": "gpii.hb.clientTests.runTests",
            "args":     ["{that}"]
        }
    }
});