const expect = require('chai').expect;
const assert = require('chai').assert;
const sinon = require('sinon');
const rewire = require('rewire');

describe('rule_utils', function() {

	let rule_utils;
	let fetch_stub;

	beforeEach(function() {

		browser_runtime_getURL_stub = function(relative_url) {
			return `moz-extension://ext-id/${relative_url}`
		}
		let browser_stub = { runtime: { getURL: browser_runtime_getURL_stub} }

		fetch_stub = sinon.stub();

		rule_utils = rewire('../../src/utils/rule_utils.js');
		rule_utils.__set__('browser', browser_stub);
		rule_utils.__set__('fetch', fetch_stub);

	})

	describe('getRules', () => {

		it('should return a Promise', () => {
			fetch_stub.resolves({
				json: sinon.stub().resolves({})
			});
			const response = rule_utils.getRules('mock_url.example');
			expect(response).to.be.an.instanceof(Promise);
		})

		it('should get the object in the corresponding JSON file', async () => {

			const mock_rules = {
				'fake_cat': [
					{
						'desc': 'my desc',
						'id': 'my-id',
						'css': '#my.css {fake: true}'
					}
				]
			}

			let response_stub = {}
			response_stub.json = sinon.stub().resolves(mock_rules)

			fetch_stub
				.withArgs('moz-extension://ext-id/rules/mock_url.example.json')
				.resolves(response_stub);

			const rules = await rule_utils.getRules('mock_url.example')
			assert.equal(typeof(rules), 'object')
			assert.deepEqual(rules, mock_rules)
		})

		it('should return empty object on getting a NetworkError when attempting to fetch resource.', async () => {
			// So, this test case is weird: it seems that current Firefox (64) will
			// never throw a NetworkError, even not when resource is non-existing,
			// while my Developer Edition (which I thought was up to date, but turned out to be version 57) _does_ throw. And recent Chrome (75) also throws?
			const error = new Error('NetworkError when attempting to fetch resource.')
			error.name = 'TypeError'
			fetch_stub.rejects(error);
			const rules = await rule_utils.getRules('non-existent.example')
			assert.equal(typeof(rules), 'object')
			assert.deepEqual(rules, {})
		})

		it('should return empty object on getting a JSON-read-error', async () => {
			const error = new Error('The operation was aborted.')
			error.name = 'AbortError'
			fetch_stub.resolves({
				json: sinon.stub().rejects(error)
			});
			const rules = await rule_utils.getRules('non-existent.example')
			assert.equal(typeof(rules), 'object')
			assert.deepEqual(rules, {})
		})

	})

	// parts of these are actually integration tests,
	// since constructCategories depends on constructCategory,
	// which depends on constructRule.
	// TODO: try to uncouple these functions!
	describe('constructCategories', () => {

		it('should convert an empty rules object to an empty array', () => {
			const categories = rule_utils.constructCategories({}, {'_categories': {}})
			assert.deepEqual(categories, [])
		})

		it('can add complex categories and rules together (INTEGRATION)', () => {

			const rulesFiles = {
				'logo': [{
					"desc": 'hide logo',
					"id": "hide-logo"
				}],
				'social': [{
					"desc": 'hide social',
					"id": 'hide-social'
				}],
				'related': [{
					"desc": 'hide related',
					"id": "hide-related"
				}],
				'stats': [{
					"desc": 'hide stats',
					"id": "hide-stats"
				}]
			}

			const settings = {
				'_status': 'true',
				'_categories': {
					'logo': true,
					'social': false, // category without rule settings
					'related': false
				},
				'hide-logo': false, // override
				'hide-related': false, // same as category
				'hide-stats': false // rule without category settings
			}

			const expected = [
				{
					id: 'logo',
					name: "NO LOGO",
					active: true,
					overridden: true,
					opened: false,

					rules: [{
						desc: "hide logo",
						id: "hide-logo",
						active: false,
						override: true
					}]
				},
			{
					id: 'social',
					name: "NO SOCIAL",
					active: false,
					overridden: false,
					opened: false,

					rules: [{
						desc: "hide social",
						id: "hide-social",
						active: false,
						override: false
					}]
				},
			{
					id: 'related',
					name: "NO RELATED",
					active: false,
					overridden: false,
					opened: false,

					rules: [{
						desc: "hide related",
						id: "hide-related",
						active: false,
						override: false
					}]
				},
			{
					id: 'stats',
					name: "NO STATS",
					active: true,
					overridden: true,
					opened: false,

					rules: [{
						desc: "hide stats",
						id: "hide-stats",
						active: false,
						override: true
					}]
				}
			]
		})

		it.skip('should add the categories in alfabetic / predetermined order (?!)', () => {
			assert.fail('determine whether we want this (and which option)')
		})

	})

	// parts of these are actually integration tests,
	// since constructCategory depends on constructRule.
	// TODO: try to uncouple these functions!
	describe('constructCategory', () => {

		it('should construct a category object even without rules', () => {
			const category = rule_utils.constructCategory('social', [], {'_categories': {}});
			const expected_category = {
				active: true,
				overridden: false,
				opened: false,
				id: 'social',
				name: "NO SOCIAL",
				rules: []
			}
			assert.deepEqual(category, expected_category)
		})

		it('can construct a category object with rules (INTEGRATION)', () => {
			const rule1 = {
				"desc": "hide logotitle",
				"id": "hide-logotitle",
				"css":  "h1 { display: none }"
			}
			const rule2 = {
				"desc": "hide something else",
				"id": "hide-something-else",
				"css":  "h3 { display: none }"
			}
			const category = rule_utils.constructCategory('social', [rule1, rule2], {'_categories': {}});
			const expected_category = {
				active: true,
				overridden: false,
				opened: false,
				id: 'social',
				name: "NO SOCIAL",
				rules: [
					{
						override: false,
						desc: "hide logotitle",
						id: "hide-logotitle",
						css:  "h1 { display: none }",
						active: true
					},
					{
						override: false,
						desc: "hide something else",
						id: "hide-something-else",
						css:  "h3 { display: none }",
						active: true
					}
				]
			}
			assert.deepEqual(category, expected_category)
		})


		it('checks the settings to set the properties of categories', () => {
			const settings = {
				'_categories': {
					'related': false
				}
			}
			const categories = rule_utils.constructCategory('related', [], settings)
			const expected_category = {
				active: false,
				overridden: false,
				opened: false,
				id: 'related',
				name: "NO RELATED",
				rules: []
			}
			assert.deepEqual(categories, expected_category)
		})

		it('checks the settings to set the properties of rules (INTEGRATION)', () => {
			const rules = [{
				"desc": "hide logotitle",
				"id": "hide-logotitle",
				"css":  "h1 { display: none }"
			}]
			const settings = {
				'_categories': {
					'logo': false
				},
				'hide-logotitle': false
			}
			const categories = rule_utils.constructCategory('logo', rules, settings)
			const expected_category = {
				active: false,
				overridden: false,
				opened: false,
				id: 'logo',
				name: "NO LOGO",
				rules: [{
					override: false,
					desc: "hide logotitle",
					id: "hide-logotitle",
					css:  "h1 { display: none }",
					active: false
				}]
			}
			assert.deepEqual(categories, expected_category)
		})

		it('sets override statuses correctly (INTEGRATION)', () => {
			const rules = [{
				"desc": "hide logotitle",
				"id": "hide-logotitle",
				"css":  "h1 { display: none }"
			}]

			const settings = {
				'_categories': {
					'logo': false
				},
				'hide-logotitle': true // this is the override!
			}
			const categories = rule_utils.constructCategory('logo', rules, settings)
			const expected_category = {
				active: false,
				overridden: true, // overridden
				opened: false,
				id: 'logo',
				name: "NO LOGO",
				rules: [{
					override: true, // is override
					desc: "hide logotitle",
					id: "hide-logotitle",
					css:  "h1 { display: none }",
					active: true // should be true
				}]
			}
			assert.deepEqual(categories, expected_category)
		})

	})

	describe('constructRule', () => {

		it('should construct rule objects', () => {
			const rule = {
				"desc": "hide logotitle",
				"id": "hide-logotitle",
				"css":  "h1 { display: none }"
			}
			const rule_obj = rule_utils.constructRule(rule, true)
			const expected_rule_obj = {
				override: false,
				desc: "hide logotitle",
				id: "hide-logotitle",
				css:  "h1 { display: none }",
				active: true
			}
			assert.deepEqual(rule_obj, expected_rule_obj)
		})

		it('uses the category status to determine its own status', () => {
			const rule = {
				"desc": "hide logotitle",
				"id": "hide-logotitle",
				"css":  "h1 { display: none }"
			}
			const rule_obj = rule_utils.constructRule(rule, false) // now: category_status is false
			const expected_rule_obj = {
				override: false,
				desc: "hide logotitle",
				id: "hide-logotitle",
				css:  "h1 { display: none }",
				active: false
			}
			assert.deepEqual(rule_obj, expected_rule_obj)
		})

		it('determines overrides correctly', () => {
			const rule = {
				"desc": "hide logotitle",
				"id": "hide-logotitle",
				"css":  "h1 { display: none }"
			}
			const rule_obj = rule_utils.constructRule(rule, false, true) // now: category_status is false, but rule overrides it!
			const expected_rule_obj = {
				override: true,
				desc: "hide logotitle",
				id: "hide-logotitle",
				css:  "h1 { display: none }",
				active: true
			}
			assert.deepEqual(rule_obj, expected_rule_obj)
		})

		it('preserves any keys that were set on the rule', () => {
			const rule = {
				"desc": "hide logotitle",
				"id": "hide-logotitle",
				"js":  "window.alert('ding dong')",
				"something-else": "blabla",
				"monty": "python"
			}
			const rule_obj = rule_utils.constructRule(rule, false, true) // now: category_status is false, but rule overrides it!
			const expected_rule_obj = {
				override: true,
				desc: "hide logotitle",
				id: "hide-logotitle",
				"js":  "window.alert('ding dong')",
				"something-else": "blabla",
				"monty": "python",
				active: true
			}
			assert.deepEqual(rule_obj, expected_rule_obj)
		})

		it("doesn't modify any the rule passed as argument", () => {
			const rule = {
				"desc": "hide logotitle",
				"id": "hide-logotitle",
				"css":  "h1 { display: none }"
			}
			const rule_copy = JSON.parse(JSON.stringify(rule))
			const rule_obj = rule_utils.constructRule(rule, false, true) // now: category_status is false, but rule overrides it!
			assert.deepEqual(rule, rule_copy)
		})

	})

	describe('getConfig', () => {

		// TODO: since this doesn't mock constructCategories and getHostStatus,
		// it's INTEGRATION - try to decouple
		it('Can handle empty rule file and no settings', async () => {

			getRulesMock = sinon.stub().resolves({})
			rule_utils.__set__('getRules', getRulesMock)

			getSettingsMock = sinon.stub().resolves({'_categories': {}})
			rule_utils.__set__('getSettings', getSettingsMock)

			config = await rule_utils.getConfig('earth.test')

			expectedConfig = { categories: [], status: true }
			assert.deepEqual(config, expectedConfig)

		})

		it.skip('consider other cases', () => {
			// other cases:
			// - if settings is given (prefetched somehow)
			// - what if there are settings but no rules for a host?
			// - more complex cases (depend mainly on constructCategories though)
			assert.fail()
		})

	})

})
