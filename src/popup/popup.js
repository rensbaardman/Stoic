const {getActiveUrl, updatePopupUrl, extractHost} = require('./js/popup_utils.js')
const {generateHeader, generateCategories, generateFooter} = require('./js/components.js')

dummy_categories = [

	{
		cat_id: 'no-logo',
		name: 'NO LOGO',
		active: true,
		overriden: true,
		opened: false,
		rules: [
			{
				desc: 'Hide logo on the left',
				id: 'no-logo-left',
				active: true,
				override: false
			},
			{
				desc: 'Hide logo on the bottom',
				id: 'no-logo-bottom',
				active: false,
				override: true
			},
			{
				desc: 'Hide logo on the right',
				id: 'no-logo-right',
				active: true,
				override: false
			}
		]
	},

	{
		cat_id: 'no-comments',
		name: 'NO COMMENTS',
		active: false,
		overriden: true,
		opened: true,
		rules: [
			{
				desc: 'Hide comment on the left',
				id: 'no-comment-left',
				active: false,
				override: false
			},
			{
				desc: 'Hide comment on the bottom',
				id: 'no-comment-bottom',
				active: true,
				override: true
			},
			{
				desc: 'Hide comment on the right',
				id: 'no-comment-right',
				active: false,
				override: false
			}
		]
	},

	{
		cat_id: 'no-social',
		name: 'NO SOCIAL',
		active: true,
		overriden: false,
		opened: false,
		rules: [
			{
				desc: 'Hide logo on the left',
				id: 'no-logo-left',
				active: true,
				override: false
			},
			{
				desc: 'Hide logo on the bottom',
				id: 'no-logo-bottom',
				active: true,
				override: false
			},
			{
				desc: 'Hide logo on the right',
				id: 'no-logo-right',
				active: true,
				override: false
			}
		]
	}
]

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
	const header = generateHeader(extractHost(url), true);
	const categories = generateCategories(dummy_categories);
	const footer = generateFooter();
	document.body.innerHTML = `${header}${categories}${footer}`;
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
