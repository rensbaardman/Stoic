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

module.exports = {
	getHostStatus: getHostStatus,
	setHostStatus: setHostStatus
}