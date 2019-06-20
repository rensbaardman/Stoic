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

async function getHostStatus(host) {
	// Setting a default ensures '_status' is always
	// available in the storage response. This simplifies
	// the handling logic.
	const default_response = { '_status': true }
	// putting brackets around [host] evaluates the variable
	// as a key (ES6)
	const settings = await browser.storage.local.get({[host]: default_response});
	return settings[host]['_status']
}

async function setHostStatus(host, status) {
	// Setting default value to {} makes sure response
	// always contains the host as key.
	const settings = await browser.storage.local.get({ [host]: {} });
	settings[host]['_status'] = status;
	browser.storage.local.set(settings)
}

async function getCategoryStatus(host, id) {
	const default_response = { '_categories': { [id]: true } };
	const settings = await browser.storage.local.get({[host]: default_response});
	return settings[host]['_categories'][id]
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

module.exports = {
	getHostStatus: getHostStatus,
	setHostStatus: setHostStatus,
	getCategoryStatus: getCategoryStatus,
	setCategoryStatus: setCategoryStatus,
	getSettings: getSettings
}