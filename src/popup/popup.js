const {getActiveUrl, extractHost} = require('../utils/url_utils.js')
const {getRules, constructCategories} = require('../utils/rule_utils.js')
const {generateHeader, generateCategories, generateFooter} = require('./components.js')

function toggle(el, className) {
	if (el.classList.contains(className)) {
		el.classList.remove(className)
	}
	else {
		el.classList.add(className)
	}
}

function addCategoryOnClickHandlers() {
	const categories = document.getElementsByClassName('category-name');
	for (let el of categories) {
		el.onclick = function(event) {
			toggle(el.parentElement, 'opened')
		}
	}
}

function addStatusOnClickHandler() {
	const status_input = document.getElementById('toggle-status');
	status_input.onclick = function(event) {
		toggle(document.body, 'disabled');
		const status = document.getElementById('status');
		if (status.innerText === 'active') {
			status.innerText = 'disabled'
		}
		else {
			status.innerText = 'active'
		}
	}
}

async function populatePopup(url) {

	if (url === undefined) {
		url = await getActiveUrl();
	}
	const host = extractHost(url)

	const rules = await getRules(host);
	const categories = constructCategories(rules);

	const header = generateHeader(host, true);
	const main = generateCategories(categories);
	const footer = generateFooter();

	document.body.classList = [];
	document.body.innerHTML = `${header}${main}${footer}`;

	addCategoryOnClickHandlers();
	addStatusOnClickHandler();
}

function tabOnUpdatedListener(tabId, changeInfo, tab) {
	// this prevents the popup from being 're-populated'
	// (refreshed) whenever new tab-info (e.g. favicon) is
	// available.
	//  TODO: test this behaviour? Either unit test or
	// functional test? (last on is hard, first one is
	// really tied to implementation...)
	// TODO: also consider behaviour with multiple windows.
	// Should probably only populate if in this current window
	// (else url update in other window - which has its own active tab (?)
	// - will change the url in this windows popup)
	const url = changeInfo.url
	if (url !== undefined & tab.active) {
		populatePopup(url)
	}
}
browser.tabs.onUpdated.addListener(tabOnUpdatedListener);

function main() {
	populatePopup()
}

main()

// necessary for functional tests,
// so we can mock url in Selenium and still
// fire tab listeners
module.exports = {
	tabOnUpdatedListeners: [tabOnUpdatedListener]
}
