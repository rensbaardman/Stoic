const assert = require('chai').assert;
const sinon = require('sinon');
const rewire = require('rewire');
// add sinon assertions to chai
sinon.assert.expose(assert, { prefix: "" });

describe('apply_utils', function() {

	let apply_utils;
	let browser_stub;

	beforeEach(function() {

		browser_stub = { tabs: sinon.stub()  }

		apply_utils = rewire('../../src/utils/apply_utils.js');
		apply_utils.__set__('browser', browser_stub);

	})

	describe('applyCategory', function() {

		it('for all rules in the category, it calls applyRule with the same tabId', function() {
			const category = {
				rules: ['a', 'b', 'c'],
				active: true
			}
			let spy = sinon.spy()
			apply_utils.__set__('applyRule', spy)
			apply_utils.applyCategory(category, 9999);
			assert.equal(spy.callCount, 3)
			assert.deepEqual(spy.firstCall.args, ['a', 9999])
			assert.deepEqual(spy.secondCall.args, ['b', 9999])
			assert.deepEqual(spy.thirdCall.args, ['c', 9999])
		})

		it('does not call applyRule if it is not active', function() {
			const category = {
				rules: ['a', 'b', 'c'],
				active: false
			}
			let spy = sinon.spy()
			apply_utils.__set__('applyRule', spy)
			apply_utils.applyCategory(category, 9999);
			assert.equal(spy.callCount, 0)
		})

	})

	describe('applyRule', function() {

		it('returns a promise', function() {
			let applyRule = apply_utils.__get__('applyRule')
			const rule = {
				active: false
			}
			assert.instanceOf(applyRule(rule, 9999), Promise);
		})

		it('does not call anything if the rule is not active', function() {

			let applyCSS_spy = sinon.spy();
			apply_utils.__set__('applyCSS', applyCSS_spy)

			let applyHide_spy = sinon.spy();
			apply_utils.__set__('applyHide', applyHide_spy)

			let applyJS_spy = sinon.spy();
			apply_utils.__set__('applyJS', applyJS_spy)

			const rule = {
				id: 'my-id',
				desc: 'my description',
				js: "window.alert('ding dong')",
				css: "* {color: red}",
				hide: "h3",
				active: false
			}

			let applyRule = apply_utils.__get__('applyRule')
			applyRule(rule, 9999);
			assert.equal(applyCSS_spy.callCount, 0)
			assert.equal(applyHide_spy.callCount, 0)
			assert.equal(applyJS_spy.callCount, 0)
		})

		it('calls all relevant methods if the rule is active', function() {

			let applyCSS_spy = sinon.spy();
			apply_utils.__set__('applyCSS', applyCSS_spy)

			let applyHide_spy = sinon.spy();
			apply_utils.__set__('applyHide', applyHide_spy)

			let applyJS_spy = sinon.spy();
			apply_utils.__set__('applyJS', applyJS_spy)

			const rule = {
				id: 'my-id',
				desc: 'my description',
				js: "window.alert('ding dong')",
				css: "* {color: red}",
				hide: "h3",
				active: true
			}

			let applyRule = apply_utils.__get__('applyRule')
			applyRule(rule, 9999);

			assert.equal(applyCSS_spy.callCount, 1)
			assert.deepEqual(applyCSS_spy.firstCall.args, ["* {color: red}", 9999])

			assert.equal(applyHide_spy.callCount, 1)
			assert.deepEqual(applyHide_spy.firstCall.args, ["h3", 9999])

			assert.equal(applyJS_spy.callCount, 1)
			assert.deepEqual(applyJS_spy.firstCall.args, ["window.alert('ding dong')", 9999])

		})

	})

	describe('removeRule', () => {

		it.skip('todo', () => {
			assert.fail('finish')
		})

	})

	describe('applyCSS', () => {

		it('applies the css with browser.tabs.insertCSS if browser.tabs.removeCSS is available', () => {

			const insertCSS_spy = sinon.spy()
			browser_stub.tabs = {
				insertCSS: insertCSS_spy,
				removeCSS: function () {}
			}

			const applyCSS = apply_utils.__get__('applyCSS');
			applyCSS('my css', 1234)

			assert.calledWith(insertCSS_spy,  1234, { code: "my css", runAt: "document_start" })

		})

		it.skip('checks if a "_stoic" style tag exists if browser.tabs.removeCSS is not available', () => {

			assert.fail('finish')

		})

		it.skip('creates a "_stoic" style tag if it did not yet exist and browser.tabs.removeCSS is not available', () => {

			assert.fail('finish')

		})

		it.skip('injects the css into the style tag if browser.tabs.removeCSS is not available', () => {

			const insertCSS_spy = sinon.spy()
			browser_stub.tabs = {
				insertCSS: insertCSS_spy, // removeCSS is undefined
				executeScript: function() {}
			}

			const applyCSS = apply_utils.__get__('applyCSS');
			applyCSS('my css', 1234)

			assert.notCalled(insertCSS_spy)
			assert.fail('finish')

		})


	})

	describe('removeCSS', () => {

		it.skip('todo', () => {
			assert.fail('finish')
		})

	})

	describe('applyHide', () => {

		it.skip('todo', () => {
			assert.fail('finish')
		})

	})

	describe('removeHide', () => {

		it.skip('todo', () => {
			assert.fail('finish')
		})

	})

	describe('applyJS', () => {

		it.skip('todo', () => {
			assert.fail('finish')
		})

	})

	describe('removeJS', () => {

		it.skip('todo', () => {
			assert.fail('finish')
		})

	})


})
