async function getActiveUrl() {
	let tabs = await browser.tabs.query({currentWindow: true, active: true});
	return tabs[0].url;
}

function updatePopupUrl() {
	getActiveUrl().then((url) => {
		let url_el = document.getElementById('url');
		url_el.innerText = url
	})
}

module.exports = {
	getActiveUrl: getActiveUrl,
	updatePopupUrl: updatePopupUrl
}