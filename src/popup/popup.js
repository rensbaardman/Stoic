async function active_url() {
	let tabs = await browser.tabs.query({currentWindow: true, active: true});
	return tabs[0].url;
}
