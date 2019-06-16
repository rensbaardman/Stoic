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

	describe('constructCategories', () => {

		it('should convert an empty rules object to an empty array', () => {
			const categories = rule_utils.constructCategories({})
			assert.deepEqual(categories, [])
		})

		it('should convert a rules object with a category without rules', () => {

			const rules = {
				"related": []
			}

			const categories = rule_utils.constructCategories(rules)
			const expected_category = {
				active: true,
				overriden: false,
				opened: false,
				cat_id: 'related',
				name: "NO RELATED",
				rules: []
			}

			assert.deepEqual(categories, [expected_category])
		})

		it.skip('should check the settings to set the properties of categories and rules', () => {
			assert.fail('finish the test')
		})

	})

	describe('constructCategory', () => {

		it('should construct a category object even without rules', () => {
			const category = rule_utils.constructCategory('social', []);
			const expected_category = {
				active: true,
				overriden: false,
				opened: false,
				cat_id: 'social',
				name: "NO SOCIAL",
				rules: []
			}
			assert.deepEqual(category, expected_category)
		})

		it('should construct a category object with rules', () => {
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
			const category = rule_utils.constructCategory('social', [rule1, rule2]);
			const expected_category = {
				active: true,
				overriden: false,
				opened: false,
				cat_id: 'social',
				name: "NO SOCIAL",
				rules: [
					{
						override: false,
						desc: "hide logotitle",
						id: "hide-logotitle",
						active: true
					},
					{
						override: false,
						desc: "hide something else",
						id: "hide-something-else",
						active: true
					}
				]
			}
			assert.deepEqual(category, expected_category)
		})
		it.skip('should check the settings to set the properties of the category', () => {
			assert.fail('finish the test')
		})

	})

	describe('constructRule', () => {

		it('should construct rule objects', () => {
			const rule = {
				"desc": "hide logotitle",
				"id": "hide-logotitle",
				"css":  "h1 { display: none }"
			}
			const rule_obj = rule_utils.constructRule(rule)
			const expected_rule_obj = {
				override: false,
				desc: "hide logotitle",
				id: "hide-logotitle",
				active: true
			}
			assert.deepEqual(rule_obj, expected_rule_obj)
		})

		it.skip('should check the settings to set the properties of rules', () => {
			assert.fail('finish the test')
		})

	})

})
