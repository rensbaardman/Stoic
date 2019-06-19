const {getActiveUrl, extractHost} = require('../utils/url_utils.js')
const {getRules, constructCategories} = require('../utils/rule_utils.js')
const {getHostStatus, setHostStatus} = require('../utils/storage_utils.js')
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

function addStatusOnClickHandler(host) {
	const status_input = document.getElementById('toggle-status');
	status_input.onclick = function(event) {

		toggle(document.body, 'disabled');

		const status = document.getElementById('status');
		if (status.innerText === 'active') {
			status.innerText = 'disabled'
			setHostStatus(host, false)
		}
		else {
			status.innerText = 'active'
			setHostStatus(host, true)
		}
	}
}

async function populatePopup(url) {

	if (url === undefined) {
		url = await getActiveUrl();
	}
	const host = extractHost(url)

	const rulesFile = await getRules(host);
	const categories = constructCategories(rulesFile);

	// always returns an object, and is empty if key not defined
	const status = await getHostStatus(host);
	const header = generateHeader(host, status);
	const main = generateCategories(categories);
	const footer = generateFooter();

	if (status === true) {
		document.body.classList = [];
	} else {
		document.body.classList = ['disabled']
	}
	document.body.innerHTML = `${header}${main}${footer}`;

	addCategoryOnClickHandlers();
	addStatusOnClickHandler(host);
}

async function tabOnUpdatedListener(tabId, changeInfo, tab) {
	// tabs.onUpdated fires many events,
	// a lot of them are not relevant for us.
	// this prevents the popup from being 're-populated'
	// (refreshed) whenever new tab-info (e.g. favicon) is
	// available.
	//  TODO: test this behaviour? Either unit test or
	// functional test? (last one is hard, first one is
	// really tied to implementation...)
	// TODO: also consider behaviour with multiple windows.
	// Should probably only populate if in this current window
	// (else url update in other window - which has its own active tab (?)
	// - will change the url in this windows popup)

	const active_url = await getActiveUrl();
	// _current_url is what we think the current url
	// is, so if that's not correct: take action.
	if (active_url !== _current_url) {
		_current_url = active_url;
		populatePopup(_current_url)
	}
}
browser.tabs.onUpdated.addListener(tabOnUpdatedListener);

let _current_url;
async function main() {
	_current_url = await getActiveUrl();
	populatePopup(_current_url)
}

main()

// necessary for functional tests,
// so we can mock url in Selenium and still
// fire tab listeners
module.exports = {
	tabOnUpdatedListeners: [tabOnUpdatedListener]
}
