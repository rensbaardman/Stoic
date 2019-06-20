const {getActiveHost, extractHost} = require('../utils/url_utils.js')
const {getRules, constructCategories} = require('../utils/rule_utils.js')
const {getHostStatus, setHostStatus, getCategorystatus, setCategoryStatus, getSettings} = require('../utils/storage_utils.js')
const {generateBody, generateHeader, generateCategories, generateFooter} = require('./components.js')


function toggle(el, className) {
	if (el.classList.contains(className)) {
		el.classList.remove(className)
	}
	else {
		el.classList.add(className)
	}
}

function addCategoryOpenHandlers() {
	const categories = document.getElementsByClassName('category-name');
	for (let el of categories) {
		el.onclick = function(event) {
			const target_name = event.target.tagName.toLowerCase()
			// since clicks on the label also causes an onClick
			// (bubble) event, which also generates an input click,
			// this prevents double toggling of the 'opened' status
			// (not filtering wouldn't have a cosmetic effects,
			// since double toggling cancels each other, but still)
			// (Note: you should be able to stop event bubbling from
			// label.onclick with event.stopPropagation(), but somehow
			// this doesn't work)
			if (target_name === 'div' || target_name === 'h3') {
				toggle(el.parentElement, 'opened')
			}
		}
	}
}

// TODO: refactor the following functions with
// .bind(null, ..., ...)
function generateStatusToggleHandler(host) {
	return function(event) {
		toggle(document.body, 'disabled');

		let status = document.getElementById('status');
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

function generateCategoryToggleHandler(host, label, cat_id) {
	return function(event) {
		toggle(document.getElementById(`cat-${cat_id}`), 'active')
		const input = label.parentElement.children[0]
		const new_status = !input.checked;
		setCategoryStatus(host, cat_id, new_status)
	}
}

function addToggleHandlers(host) {
	const labels = document.getElementsByTagName('label')

	for (let label of labels) {
		// slice(7) gets rid of 'toggle-'
		const label_for = label.htmlFor.slice(7)

		if (label_for === 'status') {
			label.onclick = generateStatusToggleHandler(host)
		}
		else if (label_for.startsWith('rule-')) {
			const rule_id = label_for.slice(5)
			// TODO!
		}
		else if (label_for.startsWith('cat-')){
			const cat_id = label_for.slice(4)
			label.onclick = generateCategoryToggleHandler(host, label, cat_id)
		}
		else {
			throw new Error(`label_for is ${label_for}, expected either 'status', 'cat-*' or 'rule-*'`)
		}
	}

}

async function generatePopup(host) {
	const rulesFile = await getRules(host);
	const settings = await getSettings(host);
	const categories = constructCategories(rulesFile, settings);
	const status = getHostStatus(settings);

	const header = generateHeader(host, status);
	const main = generateCategories(categories);
	const footer = generateFooter();

	return generateBody(header, main, footer, status);
}

async function populatePopup(host) {

	document.body.outerHTML = await generatePopup(host)

	addCategoryOpenHandlers()
	addToggleHandlers(host)
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

	const activeHost = await getActiveHost();
	// _currentHost is what we think the current host
	// is, so if that's not correct: take action.
	if (activeHost !== _currentHost) {
		_currentHost = activeHost;
		populatePopup(_currentHost)
	}
}
browser.tabs.onUpdated.addListener(tabOnUpdatedListener);

let _currentHost;
async function main() {
	_currentHost = await getActiveHost();
	populatePopup(_currentHost)
}

main()

// necessary for functional tests,
// so we can mock url in Selenium and still
// fire tab listeners
module.exports = {
	tabOnUpdatedListeners: [tabOnUpdatedListener]
}
