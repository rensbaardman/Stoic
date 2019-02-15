var utils = require('./utils.js');

// when not running this within an extension
// in Firefox or Chrome, (such as when unit testing,
// either in Node or in the browser but not within
// the extension), loading the polyfill will give the
// error 'ReferenceError: chrome is not defined',
// as the polyfill supposes that either 'browser' or
// 'chrome' has been defined. This is a quite hacky
// workaround to prevent that.
// The require statement is ignored in the Firefox-
// builds anyhow.
if (typeof browser === undefined) {
	try {
		var browser = require("webextension-polyfill");
	}
	catch (e) {
		if (!(e instanceof ReferenceError)) {
			throw e;
		}
	}
}
// TODO: somehow atomize this and place in utils (but should also work outside of that)
// TODO: consider just checking for 'typeof chrome !== undefined', but note that the
// chrome-namespace is also defined outside of extensions (just in a smaller version)


function blabla(integer) {
	return 2 * integer
}

module.exports = {
	blabla: blabla
}
