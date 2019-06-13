const {getActiveUrl, updatePopupUrl} = require('./popup_utils.js')

updatePopupUrl()
browser.tabs.onUpdated.addListener(getActiveUrl);

// necessary for functional tests,
// so we can mock url in Selenium and still
// fire tab listeners
module.exports = {
	tabOnUpdatedListeners: [updateUrl]
}
