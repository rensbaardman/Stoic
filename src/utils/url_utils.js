async function getActiveUrl() {
	let tabs = await browser.tabs.query({currentWindow: true, active: true});
	return tabs[0].url;
}

function extractHostname(url) {
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
		const hostname = new URL(url).hostname
		if (hostname.startsWith('www.')) {
			return hostname.slice(4)
		}
		else {
			return hostname;
		}
	}
}

async function getActiveHostname() {
	const activeUrl = await getActiveUrl();
	return extractHostname(activeUrl);
}

module.exports = {
	getActiveUrl: getActiveUrl,
	getActiveHostname: getActiveHostname,
	extractHostname: extractHostname
}
