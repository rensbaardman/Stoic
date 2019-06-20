async function getActiveUrl() {
	let tabs = await browser.tabs.query({currentWindow: true, active: true});
	return tabs[0].url;
}

function extractHost(url) {
	if (url.startsWith('about:')) {
		return url
	}
	else if (url.startsWith('chrome://') || url.startsWith('moz-extension://') || url.startsWith('chrome-extension://')) {
		// e.g. chrome://settings/passwords
		// becomes: [ 'chrome:', '', 'settings', 'passwords' ]
		// Interestingly, Node just works fine with URL(url).host
		// but both Chrome and Firefox say 'chrome://settings' (and the other ones)
		// is NOT a valid URL!
		return url.split('/')[2]
	}
	else {
		const host = new URL(url).host
		if (host.startsWith('www.')) {
			return host.slice(4)
		}
		else {
			return host;
		}
	}
}

async function getActiveHost() {
	const activeUrl = await getActiveUrl();
	return extractHost(activeUrl);
}

module.exports = {
	getActiveUrl: getActiveUrl,
	getActiveHost: getActiveHost,
	extractHost: extractHost
}
