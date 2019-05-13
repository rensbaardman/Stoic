// Karma configuration for unit testing with real browsers

var RewirePlugin = require("rewire-webpack");

module.exports = function(config) {
  config.set({

    frameworks: ['mocha'],

    files: [
      'test/unit/*.test.js'
    ],

    preprocessors: {
      // add webpack as preprocessor
      'test/unit/*.test.js': [ 'webpack' ]
    },

    webpack: {
        mode: "development",
        plugins: [new RewirePlugin()]
    },

    reporters: ['mocha'],


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox', 'Chrome'],
    // browsers: ['Firefox', 'Chrome', 'ChromeCanary', 'VirtualBoxEdge14'],
    // to use the Microsoft Edge Virtual Box, make sure to install the official virtual machine first, and add a launcher to customLaunchers. See https://www.npmjs.com/package/karma-virtualbox-edge-launcher.
    // alternatively on Windows: use the regular Edge karma launcher (karma-edge-launcher) (TODO: configure this automatically?)
    // possibly also: use Chrome Puppeteer for quicker headless testing? (https://github.com/GoogleChrome/puppeteer, see karma-puppeteer-launcher). Or JSDom
    // also: Opera? (karma-opera-launcher) VIvaldi? (karma-vivaldi-launcher) Brave? (karma-brave-launcher)
    // more browsers: 'FirefoxDeveloper', 'FirefoxAurora', 'FirefoxNightly'

    // for extensions: use customlaunchers! 
    // see e.g. https://github.com/karma-runner/karma-firefox-launcher#loading-firefox-extensions
    // also check: https://github.com/karma-runner/karma-firefox-launcher/issues/89

    // possibly use karma-detect-browsers:  https://www.npmjs.com/package/karma-detect-browsers


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
