const CATEGORIES = {
	'related': 'NO RELATED',
	'social': 'NO SOCIAL',
	'logo': "NO LOGO"
}

async function getRules(host) {
	const url = browser.runtime.getURL(`rules/${host}.json`)
	// object of type Response (even if request is unsuccesfull?)
	let reponse;
	try {
		response = await fetch(url);
	}
	catch (err) {
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

function constructCategories(rules) {
	const cat_ids = Object.keys(rules)
	return cat_ids.map( (id) => constructCategory(id, rules[id]) )
}

function constructCategory(cat_id, rules) {
	return {
		active: true,
		overriden: false,
		opened: false,
		cat_id: cat_id,
		name: CATEGORIES[cat_id],
		rules: rules.map(constructRule)
	}
}

function constructRule(rule) {
	return {
		override: false,
		desc: rule.desc,
		id: rule.id,
		active: true
	}
}

module.exports = {
	getRules: getRules,
	constructCategories: constructCategories,
	constructCategory: constructCategory,
	constructRule: constructRule
}
