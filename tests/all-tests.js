"use strict";
var sequence = require("when/sequence");

var tests = [
    "./js/server-tests.js",
    "./js/zombie-binder-tests.js",
    "./js/zombie-initBlock-tests.js",
    "./js/zombie-inline-tests.js",
    "./js/zombie-rendering-tests.js",
    "./js/zombie-templateAware-tests.js",
    "./js/zombie-templateFormControl-tests.js",
    "./js/zombie-templateMessage-tests.js"
];
var promises = [];
tests.forEach(function (testFile) {
    promises.push(require(testFile));
});
sequence(promises);