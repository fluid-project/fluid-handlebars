/*
    This component is designed to feed template content stored on the server to the client-side components included
    with this library.

    This component requires the full path to all template content.  That path is expected to point to a directory
    that follows the handlebars conventions, and stores template content in subdirectories based on the type of template
    (`layouts`, `pages`, and `partials`).  Any content found in these subdirectories will be read and stored in the
    `templates` member object using the template directory name and the filename (minus the handlebars suffix).

    Say that we have a views directory that contains a `pages` subdirectory, and that the `pages` subdirectory contains
    a single template, called `myTemplate.handlebars`.  When `loadTemplates` finishes running, the `templates` member
    object should look like:

     {
       pages: {
         myTemplate: "..." // template content omitted for brevity
       }
     }

     With the data this router supplies, the handlebars client has what it needs to load partials and handle updating
     markup on the client side.
 */

"use strict";
var fluid  = fluid || require("infusion");
var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.hb.inline");
var fs     = require("fs");
var path   = require("path");

fluid.registerNamespace("gpii.express.hb.inline.request");
gpii.express.hb.inline.request.sendResponse = function (that) {
    if (that.options.templates) {
        gpii.express.requestAware.sendResponse(that, 200, { ok: true, templates: that.options.templates });
    }
    else {
        gpii.express.requestAware.sendResponse(that, 500, { ok: false, message: that.options.messages.noTemplates});
    }
};

fluid.defaults("gpii.express.hb.inline.request", {
    gradeNames: ["gpii.express.requestAware", "autoInit"],
    templates: "{inline}.templates",
    messages: {
        noTemplates: "No templates were found."
    },
    listeners: {
        "onCreate.sendResponse": {
            funcName: "gpii.express.hb.inline.request.sendResponse",
            args:     ["{that}"]
        }
    }
});

gpii.express.hb.inline.loadTemplates =  function (that, dir) {
    // Start with the "views" directory and work our way down
    var dirContents = fs.readdirSync(dir);
    dirContents.forEach(function (entry) {
        var subDirPath = path.resolve(dir, entry);
        var stats = fs.statSync(subDirPath);
        if (stats.isDirectory() && that.options.allowedTemplateDirs.indexOf[entry] !== -1) {
            gpii.express.hb.inline.scanTemplateSubdir(that, entry, subDirPath);
        }
    });

    //that.options.dynamicComponents.requestHandler.options.templates = that.templates;

    that.events.templatesLoaded.fire(that);
};

gpii.express.hb.inline.scanTemplateSubdir = function (that, key, dirPath) {
    var dirContents = fs.readdirSync(dirPath);
    dirContents.forEach(function (entry) {
        var entryPath = path.resolve(dirPath, entry);
        var stats = fs.statSync(entryPath);
        if (stats.isFile()) {
            var matches = that.options.hbsExtensionRegexp.exec(entry);
            if (matches) {
                var templateName = matches[1];
                var templateContent = fs.readFileSync(entryPath, {encoding: "utf8"});
                that.templates[key][templateName] = templateContent;
            }
        }
    });
};

fluid.defaults("gpii.express.hb.inline", {
    gradeNames:          ["gpii.express.requestAware.router", "autoInit"],
    path:                "/inline",
    hbsExtensionRegexp:  /^(.+)\.(?:hbs|handlebars)$/,
    allowedTemplateDirs: ["layouts", "partials", "pages"],
    config:              "{expressConfigHolder}.options.config",
    members: {
        templates: {
            layouts:  {},
            pages:    {},
            partials: {}
        }
    },
    events: {
        templatesLoaded: null
    },
    requestAwareGrades: ["gpii.express.hb.inline.request"],
    listeners: {
        "onCreate.loadTemplates": {
            funcName: "gpii.express.hb.inline.loadTemplates",
            args:     [ "{that}", "{that}.options.config.express.views" ]
        }
    }
});