#!/usr/bin/env node

// setup Jasmine
const Jasmine = require('jasmine');
const HtmlReporter = require('jasmine-pretty-html-reporter').Reporter;
const jasmine = new Jasmine();


jasmine.loadConfig({
  spec_files: [
    "/spec/*.spec.js",
  ],
  helpers: [
    "test/helpers/login.js"
  ],
  random:false,
  seed: null,
  stopSpecOnExpectationFailure: false
});

jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;


// initialize and execute
jasmine.env.clearReporters();

jasmine.addReporter(new HtmlReporter({
  path: __dirname + '/coverage/jasmine-report'
}));

jasmine.execute();