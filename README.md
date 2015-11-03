# Introduction

This package provides components to assist in rendering handlebars templates both on the server and client side.

# Server-side Usage

To add this library to your server-side dependencies, add it to your `package.json` file, as in:

```
  ...
  "dependencies": {
    "gpii-handlebars": "git://github.com/the-t-in-rtf/gpii-handlebars.git",
  },
  ...
```

## Handlebars Middleware

The handlebars middleware provided in this package is a wrapper around [`express-handlebars`](https://github.com/ericf/express-handlebars).  Like that package, it provides a renderer that can be used with the Express `Response` object.  That renderer expects to start with a layout, and to replace the `{{body}}` variable in that layout with the contents of a template (`foo.handlebars` in our example).  Templates can references "partials", using notation like `{{>partial}}` or `{{>partial variable}}`.  These will be replaced with the context of the partial,
rendered using either a supplied variable or the current context.

To use this middleware, you need to make it aware of one or more directories that contain templates (typically via the `options.config.express.views` option in your `gpii.express` configuration.  Each of these view directories can have the following subdirectories:

1. `layouts`
2. `pages`
3. `partials`

The handlebars middleware supports inheritance between multiple view directories.  Layouts, pages and partials will be rendered from the first matching view directory.

## Dispatcher Router

The dispatcher router turns the last part of a path (such as `/dispatcher/foo`) into a template name (such as `foo`),
and then attempts to find and render that template.  The dispatcher router is configured using the same options as the handlebars middleware, and supports the same kind of inheritance.

## Inline Router

The inline router reads all of the template content from one or more view directories and bundles this content up so that it can be used by the client-side renderer.  The inline router is configured using the same options as the handlebars middleware, and supports the same kind of inheritance.

# Client-side Usage

To install this package on the client side, add it to your bower dependencies, as in:

```
bower install --save git://github.com/GPII/gpii-handlebars.git
```

# Client-side `renderer`

The client side renderer provides the ability to insert rendered content into the DOM.  It expects to either be
preconfigured with template content via its options, or to read the template content from the `inline` router (see above).  For more details, see the comments in `src/js/client/renderer.js`.

# The `binder` component

The `binder` component links view elements to model elements, so that updates are propagated in both directions.  It can be used to create complex dynamic forms.  For more details, see the comments in `src/js/client/binder.js`, and look at the `templateAware`, `templateFormControl`,  and `templateRequestAndRender` components.

# Helper Functions

This package provides additional handlebars helpers that can be used in your handlebars templates.  On the server side,
these are available by default when you use the `gpii.express.hb` handlebars middleware.  On the client side, these are
prewired into `gpii.templates.renderer`, the client-side renderer.

## jsonify

Convert an object into a string representation using JSON.stringify.  To use this function in your handlebars templates, add code like:

```
{{jsonify variable}}
```

## md

Transform markdown into html.  To use this function in your handlebars templates, add code like:

```
{{md variable}}

{{md "string value"}}
```

## equals

Display content when two values match.  Values can be context variables or strings:

```
{{#equals json.baz json.qux}}true{{else}}false{{/equals}}

{{#equals json.foo json.qux}}true{{else}}false{{/equals}}

{{#equals json.foo "bar"}}true{{else}}false{{/equals}}

{{#equals "nonsense" json.qux}}true{{else}}false{{/equals}}
```

Note that, just like the {{#if}} block provided by handlebars, the {{#equals}} block supports the use of an optional {{else}} block for cases in which the two values are not equal.

## `initBlock` helper

The most powerful feature of the server-side template rendering is the `initBlock` helper (this is not available on the client side).  This helper takes one or more grade
names and generates client-side javascript that ultimately creates a view component which has those grades.

Thus, in a simple bit of handlebars markup, you can create nearly any view component, as in:

    {{{initBlock "your.grade" "your.other.grade"}}}

Note that the triple braces are required to avoid escaping the output.  For more details on the `initBlock` helper, read the comments in `src/js/server/initBlock.js` and look at the tests in this package.

# Testing This Module

On OS X and Linux, building this module should be as simple as running the following commands in order:

1. `npm install`
2. `npm test`

## Testing on Windows

This module uses [Zombie](http://zombie.labnotes.org/) for client-side testing.  This requires "contextify", which cannot be automatically built under windows because of problems with `node-gyp` in that environment.

To run the `npm install` command for this module under windows, you will need to follow [the instructions for installing `node-gyp`](https://github.com/TooTallNate/node-gyp/wiki/Visual-Studio-2010-Setup) first, and save "contextify" to your local npm cache using `npm install`.