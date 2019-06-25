async function applyCategory(category, tabId) {
	if (category.active === true) {
		category.rules.map(rule => applyRule(rule, tabId))
	}
}


async function applyRule(rule, tabId) {

	if (rule.active === false) {
		return
	}

	if (rule.css !== undefined) {
		applyCSS(rule.css, tabId)
	}

	if (rule.hide !== undefined) {
		applyHide(rule.hide, tabId)
	}

	if (rule.js !== undefined) {
		applyJS(rule.js, tabId)
	}

}

function removeRule(rule, tabId) { }


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

function addRuleToStylesheet(css, tabId) {
	const src =
`if (typeof(_stoicStyleSheet) === 'undefined') {
	_stoicStyleSheet = _stoicStyleTag.sheet;
}
_stoicStyleSheet.insertRule('${css}');
undefined`
	return browser.tabs.executeScript(tabId, {code: src})
}

function removeCSS(css, tabId) { }


function applyHide(selector, tabId) {}

function removeHide(selector, tabId) {}


function applyJS(src, tabId) {}

function removeJS(src, tabId) {}


module.exports = {
	applyCategory: applyCategory
}
