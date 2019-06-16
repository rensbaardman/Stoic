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

async function populatePopup() {
	const url = await getActiveUrl();
	const host = extractHost(url)

	const rules = await getRules(host);
	const categories = constructCategories(rules);

	const header = generateHeader(host, true);
	const main = generateCategories(categories);
	const footer = generateFooter();

	document.body.innerHTML = `${header}${main}${footer}`;

	addCategoryOnClickHandlers();
	addStatusOnClickHandler();
}



populatePopup()
browser.tabs.onUpdated.addListener(populatePopup);

// necessary for functional tests,
// so we can mock url in Selenium and still
// fire tab listeners
module.exports = {
	tabOnUpdatedListeners: [populatePopup]
}
