const {getConfig} = require('./rule_utils.js')
const {diff} = require('deep-object-diff')


function applyAll(categories, tabId) {
	categories.map(category => applyCategory(category, tabId))
}

function removeAll(categories, tabId, force = false) {
	categories.map(category => removeCategory(category, tabId, force))
}

function applyCategory(category, tabId) {
	// actually, we might as well throw away this check,
	// since each rule also has a status indicator
	// (this only saves checking those when the category is inactive
	// and not overridden)
	if (category.active === true || category.overridden === true) {
		category.rules.map(rule => applyRule(rule, tabId))
	}
}

function removeCategory(category, tabId, force = false) {
	category.rules.map(rule => removeRule(rule, tabId, force))
}


function applyRule(rule, tabId) {

	if (rule.active === false) {
		return
	}

	if (rule.css !== undefined) {
		applyCSS(rule.css, tabId)
	}

	if (rule.hide !== undefined) {
		applyHide(rule.hide, tabId)
	}

}

function removeRule(rule, tabId, force = false) {

	// If we force, we do not take into account
	// whether this rule is active / an override.
	if (rule.active === false || force === true) {

		if (rule.css !== undefined) {
			removeCSS(rule.css, tabId)
		}

		if (rule.hide !== undefined) {
			removeHide(rule.hide, tabId)
		}

		if (rule.js !== undefined) {
			removeJS(rule.js, tabId)
		}

	}

}


async function applyCSS(css, tabId) {

	if (typeof(browser.tabs.removeCSS) === 'function') {
		// Add runAt option, to make sure insertion doesn't
		// wait for DOM to load (which is default)
		browser.tabs.insertCSS(tabId, {code: css, runAt: 'document_start'})
	}
	else {
		await createStylesheet(tabId);
		addRuleToStylesheet(css, tabId);
	}

}

function removeCSS(css, tabId) {

	if (typeof(browser.tabs.removeCSS) === 'function') {
		// Leave out 'runAt', since this won't be called
		// at document load.
		browser.tabs.removeCSS(tabId, {code: css})
	}
	else {
		removeRuleFromStylesheet(css, tabId);
	}

}

/* istanbul ignore next : we don't test constants */
function createStylesheet(tabId) {

	// TODO: change structure so this gets called only once,
	// to improve performance (e.g. call it in the background script,
	// maybe even without checks to check if there are active css rules.
	// Or do this in a content script? But then we have to check
	// whether it has finished before applying CSS, anyway).

	// Idempotent function: create the styleTag
	// only if it did not exist yet.
	// (note that we set _stoicStyleTag as global variable,
	// so we can use it later on)
	const src =
`if (typeof(_stoicStyleTag) === 'undefined') {
	_stoicStyleTag = document.querySelector('style#_stoic');
	if (_stoicStyleTag === null) {
		_stoicStyleTag = document.createElement('style');
		_stoicStyleTag.id = '_stoic';
		document.head.appendChild(_stoicStyleTag);
	}
} `
	// Return undefined, to prevent
	// 'result is non-structured-clonable data' Errors.
	+ `undefined;`

	// TODO: also add "runAt: 'document_start'" to this?
	// But can we be sure that the <head> is already available
	// by then?
	return browser.tabs.executeScript(tabId, {code: src})
}

/* istanbul ignore next : we don't test constants */
function addRuleToStylesheet(css, tabId) {
	const src =
`if (typeof(_stoicStyleSheet) === 'undefined') {
	_stoicStyleSheet = _stoicStyleTag.sheet;
}
_stoicStyleSheet.insertRule('${css}');
undefined`
	return browser.tabs.executeScript(tabId, {code: src})
}

/* istanbul ignore next : we don't test constants */
function removeRuleFromStylesheet(css, tabId) {
	// We assume the variable '_stoicStyleSheet'
	// has been defined (since the rule should have been
	// added before, andn then the variables was declared).
	const src = `_stoicStyleSheet.removeRule('${css}'); undefined`
	return browser.tabs.executeScript(tabId, {code: src})
}




function applyHide(selector, tabId) {
	const css = `${selector} { display: none; }`;
	return applyCSS(css, tabId);
}

function removeHide(selector, tabId) {
	const css = `${selector} { display: none; }`;
	return removeCSS(css, tabId);
}


function applyChanges(host, oldSettings, newSettings) {

	const settingsDiff = diff(oldSettings, newSettings)

	// Helpful later on if _categories is always defined
	if (oldSettings['_categories'] === undefined) {
		oldSettings['_categories'] = {}
	}
	if (newSettings['_categories'] === undefined) {
		newSettings['_categories'] = {}
	}


	// usually, there is only one key changed
	for (let key in settingsDiff) {

		if (key === '_status') {
			// oldStatus might be undefined, but that is OK.
			const oldStatus = oldSettings['_status']
			const newStatus = newSettings['_status']
			applyStatusChange(host, newSettings, {old: oldStatus, new: newStatus})
		}
		else if (key === '_categories') {

			// !!!
			// TODO: do nothing if '_status' is false,
			// since then everything has been removed already.
			// !!!

			const catDiff = settingsDiff['_categories']

			// usually, there is only one category changed
			for (catId in catDiff) {

				const oldStatus = oldSettings['_categories'][catId]
				const newStatus = newSettings['_categories'][catId]
				applyCategoryChange(host, newSettings, catId, {old: oldStatus, new: newStatus})
			}
		}

	}
}

async function applyStatusChange(host, settings, status) {
	const {categories} = await getConfig(host, settings);
	const tabs = await browser.tabs.query({url: `*://*.${host}/*`})

	if (status.new === false) {
		tabs.map(tab => removeAll(categories, tab.id, force=true))
	}
	else if (status.old === false && status.new === true) {
		tabs.map(tab => applyAll(categories, tab.id))
	}
	else {
		// this should not happen (right?)
		throw new Error(`didn't expect applyStatusChange to be called with old: ${status.old} and new: ${status.new}`)
	}
}

async function applyCategoryChange(host, settings, catId, status) {
	const {categories} = await getConfig(host, settings);
	category = categories.find(cat => (cat.id === catId))
	const tabs = await browser.tabs.query({url: `*://*.${host}/*`})

	if (status.new === false) {
		tabs.map(tab => removeCategory(category, tab.id, force=true))
	}
	else if (status.old === false && status.new === true) {
		tabs.map(tab => applyCategory(category, tab.id))
	}
	else {
		// this should not happen (right?)
		throw new Error(`didn't expect applyCategoryChange to be called with old: ${status.old} and new: ${status.new}`)
	}
}

module.exports = {
	applyAll: applyAll,
	applyChanges: applyChanges
}
