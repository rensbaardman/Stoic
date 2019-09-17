const {getRules, getConfig} = require('./utils/rule_utils.js')
const {extractHostname} = require('./utils/url_utils.js')
const {getHostStatus, getSettings} = require('./utils/storage_utils.js')
const {applyAll, applyChanges} = require('./utils/apply_utils.js')


async function handleTab(tab) {
	const host = extractHostname(tab.url);

	const {status, categories} = await getConfig(host)

	if (status === true) {
		applyAll(categories, tab.id)
	}
}

async function tabOnUpdatedListener(tabId, changeInfo, tab) {
	// Multiple events are fired when url changes,
	// only catch the on where we get the new url.
	// TODO: there are events that happen earlier than this one
	// - consider using those?
	// TODO: check that this never fires if it shouldn't.
	// TODO: check that Firefox and Chrome fire same / similar
	// events.
	if (typeof(changeInfo.url) !== 'undefined') {
		handleTab(tab)
	}
}

function storageOnChangedListener(changes, areaName) {
	if (areaName === 'local') {
		for (let host in changes) {

			let oldSettings = changes[host].oldValue;
			// If settings weren't set before,
			// oldValue will be undefined.
			if (oldSettings === undefined) {
				oldSettings = {}
			}
			// TODO: apparently, newValue is not always defined?!
			let newSettings = changes[host].newValue;

			applyChanges(host, oldSettings, newSettings)
		}
	}
}

async function main() {
	// can we assume that all urls are available on load?
	const tabs = await browser.tabs.query({})
	tabs.map(handleTab)
}

main()

browser.tabs.onUpdated.addListener(tabOnUpdatedListener);
browser.storage.onChanged.addListener(storageOnChangedListener);
