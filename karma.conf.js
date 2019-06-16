// Karma configuration for unit testing with real browsers
// (npm run test:unit:browser)

const RewireWebpackPlugin = require('rewire-webpack-plugin');

module.exports = function(config) {

	config.set({

		frameworks: ['mocha'],
		reporters: ['mocha'],

		files: [
			'test/unit/*.test.js'
		],

		preprocessors: {
			'test/unit/*.test.js': [ 'webpack' ]
		},

		webpack: {
			mode: "development",
			plugins: [new RewireWebpackPlugin()]
		},

		// else errors will be like
		// expected [ Array(14) ] to deeply equal [ Array(14) ]
		mochaReporter: {
			showDiff: true
		},

		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		autoWatch: false,

		browsers: ['Firefox', 'Chrome'],
		// more browsers: 'FirefoxDeveloper', 'FirefoxAurora', 'FirefoxNightly'

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	})

}
