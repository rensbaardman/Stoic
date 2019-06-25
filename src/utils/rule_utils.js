const {CATEGORIES} = require('./constants.js')

async function getRules(host) {
	const url = browser.runtime.getURL(`rules/${host}.json`)
	// object of type Response (even if request is unsuccesfull?)
	let response;
	try {
		response = await fetch(url);
	}
	catch (err) {
		// TODO: when do these errors happen?
		// I had it once when the file does not exist.
		// But then returning {} is the right thing to do.
		return {}
	}
	// the following is strange:
	// even if an url is not valid
	// ('Access to the file was denied
	// The file at moz-extension://55a1abfc-553d-8f47-a34d-770e04b85675/rules/undefined.json is not readable.)
	// status code is still 200!

	// so we have do to the following:
	try {
		// you have to await it to know whether it was truly succesfull!
		const json = await response.json()
		return json
	} catch (err) {
		// When the json-file hasn't been found
		if (err.name === 'AbortError') {
			return {}
		}
		else {
			throw err
		}
	}
}

function constructCategories(rulesFile, settings) {
	const cat_ids = Object.keys(rulesFile)
	return cat_ids.map( (id) => constructCategory(id, rulesFile[id], settings) )
}

function constructCategory(id, rules, settings) {
	let cat_status = settings['_categories'][id]
	if (cat_status === undefined) {
		cat_status = true
	}

	let overriden = false;
	let constructedRules = []
	for (let rule of rules) {
		// this might be undefined, but that works too
		let rule_status = settings[rule.id];

		if (rule_status !== undefined && rule_status !== cat_status) {
			overriden = true;
		}

		const rule_obj = constructRule(rule, cat_status, rule_status)
		constructedRules.push(rule_obj)
	}

	return {
		active: cat_status,
		overriden: overriden,
		opened: false,
		id: id,
		name: CATEGORIES[id],
		rules: constructedRules
	}
}

function constructRule(rule, cat_status, status) {
	// make a copy of the rule
	let constructedRule = JSON.parse(JSON.stringify(rule))

	if (status === undefined) {
		status = cat_status
	}
	constructedRule.active = status;

	if (status === cat_status) {
		constructedRule.override = false;
	}
	else {
		constructedRule.override = true;
	}

	return constructedRule
}

module.exports = {
	getRules: getRules,
	constructCategories: constructCategories,
	constructCategory: constructCategory,
	constructRule: constructRule
}
