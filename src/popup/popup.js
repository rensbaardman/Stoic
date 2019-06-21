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
	const categories = document.getElementsByClassName('category');
	for (let category of categories) {
		category.onclick = function(event) {
			const target_name = event.target.tagName.toLowerCase()
			// Filter out clicks on label toggle that bubble to parent.
			// (Note: you should be able to stop event bubbling from
			// label.onclick with event.stopPropagation(), but somehow
			// this doesn't work)
			if (['li', 'div', 'h3'].includes(target_name))  {
				toggle(category, 'opened')
			}
		}
	}
}

// We .bind() the host later on,
// so that it becomes an eventHandler.
function statusToggleHandler(host, event) {
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

// We .bind() the host, label and cat_id later on,
// so that it becomes an eventHandler.
function categoryToggleHandler(host, label, cat_id, event) {
	toggle(document.getElementById(`cat-${cat_id}`), 'disabled')
	const input = label.parentElement.children[0]
	const new_status = !input.checked;
	setCategoryStatus(host, cat_id, new_status)
}

function addToggleHandlers(host) {
	const labels = document.getElementsByTagName('label')

	for (let label of labels) {
		// slice(7) gets rid of 'toggle-'
		const label_for = label.htmlFor.slice(7)

		if (label_for === 'status') {
			// set 'this' to null, and then fix the host
			label.onclick = statusToggleHandler.bind(null, host)
		}
		else if (label_for.startsWith('rule-')) {
			const rule_id = label_for.slice(5)
			// TODO!
		}
		else if (label_for.startsWith('cat-')){
			const cat_id = label_for.slice(4)
			// set 'this' to null, and then fill in the other variables
			label.onclick = categoryToggleHandler.bind(null, host, label, cat_id)
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

	// Interestingly, the following adds a harmless empty
	// <head></head> tag. See https://stackoverflow.com/questions/52888347/setting-document-body-outerhtml-creates-empty-heads-why
	document.body.outerHTML = await generatePopup(host)

	addCategoryOpenHandlers()
	addToggleHandlers(host)
}

async function tabOnUpdatedListener(tabId, changeInfo, tab) {
	// Ensures popup will only be repopulated after true
	// host change, not with either refresh or following link
	// with same host or if new info (e.g. favicon) is available.

	const activeHost = await getActiveHost();
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
