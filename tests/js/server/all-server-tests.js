/* eslint-env node */
/* eslint-env node */
"use strict";

// TODO: These must run before the dispatcher tests, or the dispatcher tests will fail to load the secondary template directory.  Review together as part of the PR.
require("./standaloneRenderer-tests");

require("./dispatcher-tests.js");
require("./errorRenderingMiddleware-tests");
require("./first-matching-path-tests");
require("./i18n-unit-tests");
require("./inline-tests");
require("./inlineMessageBundlingMiddleware-tests");
require("./live-reload-tests");
require("./resolver-tests");
require("./singleTemplateMiddleware-tests");
require("./standaloneRenderer-tests");
require("./watcher-tests");
