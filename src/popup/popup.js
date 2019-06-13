async function active_url() {
	let tabs = await browser.tabs.query({currentWindow: true, active: true});
	return tabs[0].url;
}

active_url().then((url) => {
	let url_el = document.getElementById('url');
	url_el.innerText = url
})

function updateUrl() {
	active_url().then((url) => {
		let url_el = document.getElementById('url');
		url_el.innerText = url
	})
}

updateUrl()
browser.tabs.onUpdated.addListener(updateUrl);

// necessary for functional tests,
// so we can mock url in Selenium and still
// fire tab listeners
module.exports = {
	tabOnUpdatedListeners: [updateUrl]
}
