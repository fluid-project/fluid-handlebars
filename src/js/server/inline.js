"use strict";
// This script will take one or more server-side template directories and inline their contents on a page.  Used to expose templates for client-side rendering.
var fluid  = fluid || require("infusion");
var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.hb.inline");
var fs     = require("fs");

gpii.express.hb.inline.loadTemplates =  function (that, dir, res) {
    var dirContents = fs.readdirSync(dir);
    dirContents.forEach(function (entry) {
        var path = dir + "/" + entry;
        var stats = fs.statSync(path);
        if (stats.isFile()) {
            var matches = that.options.hbsExtensionRegexp.exec(entry);
            if (matches) {
                var templateType = dir.indexOf("partials") !== -1 ? "partial" : "template";
                var key =  templateType + "-" + matches[1];

                // cache file information so that we only reload templates that have been updated
                if (that.model.cache[key] && stats.mtime.getTime() === that.model.cache[key].mtime.getTime()) {
                    //console.log("Skipping cached " + templateType + " '" + key + "'...");
                }
                else {
                    that.applier.change("updated", true);
                    // TODO:  Talk with Antranig about the best way to update this kind of structure using a change applier.
                    that.model.cache[key] = {
                        mtime: stats.mtime,
                        content: fs.readFileSync(path)
                    };
                }
            }
        }
        else if (stats.isDirectory()) {
            // call the function recursively for each directory
            that.loadTemplates(path, res);
        }
    });
};


gpii.express.hb.inline.wrapTemplate = function (that, key, content) {
    // We have to pseudo-escape script tags to avoid them breaking our templates.
    return "<script id=\"" + key + "\" type=\"text/x-handlebars-template\">" + content.toString().replace(that.options.hbsScriptRegexp, "{{!}}$1") + "</script>\n\n";
};

gpii.express.hb.inline.getRouterFunction = function (that) {
    return function (req, res) {
        that.loadTemplates(that.options.config.express.views, res);

        if (that.model.updated) {
            //console.log("Generating html output...");
            that.model.html = "";
            Object.keys(that.model.cache).forEach(function (key) {
                that.model.html += that.wrapTemplate(key, that.model.cache[key].content);
            });
        }
        else {
            //console.log("Sending cached html output...");
        }

        res.status(200).send(that.model.html);
    };
};


fluid.defaults("gpii.express.hb.inline", {
    gradeNames: ["gpii.express.router", "fluid.modelRelayComponent", "autoInit"],
    path:               "/inline",
    hbsExtensionRegexp: /^(.+)\.(?:hbs|handlebars)$/,
    hbsScriptRegexp:    /(script>)/g,
    model: {
        cache:              {},
        html:               "",
        updated:            false
    },
    events: {
        addRoutes: null
    },
    invokers: {
        "getRouterFunction": {
            funcName: "gpii.express.hb.inline.getRouterFunction",
            args: ["{that}"]
        },
        "loadTemplates": {
            funcName: "gpii.express.hb.inline.loadTemplates",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        },
        "wrapTemplate": {
            funcName: "gpii.express.hb.inline.wrapTemplate",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        }
    }
});