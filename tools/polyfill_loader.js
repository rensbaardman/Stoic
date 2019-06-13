// Webpack loader to prepend the webextension-polyfill.
// Used for Chrome only.
function polyfill_loader(src) {
	// use window.browser to set it globally, so we can also access it in functional tests with
	// selenium. TODO: maybe add a switch for this so we don't pollute it in
	// production? On the other hand: is only in popup context.
	return `window.browser = require('webextension-polyfill')\n\n${src}`
}

module.exports = polyfill_loader
