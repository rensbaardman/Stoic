const defaults = require('./defaults.js')

async function getSettings(host) {
	const response = await browser.storage.local.get({[host]: {} })
	let settings = response[host]
	// helps in ensuring '_categories' is always undefined
	// (its members might be undefined, but at least won't throw)
	if (settings['_categories'] === undefined) {
		settings['_categories'] = {}
	}
	return settings
}

function getHostStatus(settings) {
	if (settings['_status'] !== undefined) {
		return settings['_status']
	} else {
		return defaults.SITE_STATUS;
	}
}

async function setHostStatus(host, status) {
	// Setting default value to {} makes sure response
	// always contains the host as key.
	const settings = await browser.storage.local.get({ [host]: {} });
	settings[host]['_status'] = status;
	browser.storage.local.set(settings)
}

async function setCategoryStatus(host, id, status) {
	const settings = await browser.storage.local.get({ [host]: {} });
	// The stored settings might not have the _categories object
	// set yet; set it to {} so we are assured it exists.
	if (settings[host]['_categories'] === undefined) {
		settings[host]['_categories'] = {};
	}
	settings[host]['_categories'][id] = status;
	browser.storage.local.set(settings)
}

async function setRuleStatus(host, id, status) {
	const settings = await browser.storage.local.get({ [host]: {} });
	settings[host][id] = status;
	browser.storage.local.set(settings)
}

module.exports = {
	getHostStatus: getHostStatus,
	setHostStatus: setHostStatus,
	setCategoryStatus: setCategoryStatus,
	setRuleStatus: setRuleStatus,
	getSettings: getSettings
}
