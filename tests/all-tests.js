"use strict";
var tests = [
    "./js/server-tests.js",
    "./js/zombie-binder-tests.js",
    "./js/zombie-initBlock-tests.js",
    "./js/zombie-rendering-tests.js",
    "./js/zombie-templateAware-tests.js",
    "./js/zombie-templateFormControl-tests.js",
    "./js/zombie-templateMessage-tests.js"
];
tests.forEach(function (testFile) {
    require(testFile);
});
