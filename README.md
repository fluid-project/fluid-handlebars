A helper library to assist in pulling in handlebars content both on the server and client side.  Provides a handful of helper functions (see ["functions"](#Functions) below).

# Server-side installation instructions

This is currently an unlisted repository.  To add this library to your server-side dependencies, add it to your package.json file, as in:

```
  ...
  "dependencies": {
    "fluid-handlebars-helper": "git://github.com/the-t-in-rtf/fluid-handlebars-helper.git",
  },
  ...
```

For examples of server-side usage, take a look at the tests in ```src/tests/js/server-tests.js```.

# Client-side installation instructions

To make this available on the client side, add it to your bower dependencies, as in:

```
bower install --save git://github.com/the-t-in-rtf/fluid-handlebars-helper.git
```

For examples of client-side usage, take a look at the tests in ```src/tests/html```.


# Functions

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


# Testing This Module

On OS X and Linux, building this module should be as simple as running the following commands in order:

1. `bower install`
2. `npm install`
3. `grunt dedupe-infusion`
4. `node tests/all-tests.js`

## Testing on Windows

This module uses [Zombie](http://zombie.labnotes.org/) for client-side testing.  This requires "contextify", which cannot be automatically built under windows because of problems with `node-gyp` in that environment.

To run the `npm install` command for this module under windows, you will need to follow [the instructions for installing `node-gyp`](https://github.com/TooTallNate/node-gyp/wiki/Visual-Studio-2010-Setup) first, and save "contextify" to your local npm cache using `npm install`.
