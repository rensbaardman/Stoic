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

	describe('applyAll', () => {

		it('calls applyCategory for all given categories', () => {

			applyCategory_spy = sinon.spy()
			apply_utils.__set__('applyCategory', applyCategory_spy)

			const categories = ['cat1', 'cat2']
			apply_utils.applyAll(categories, 9999)

			assert.equal(applyCategory_spy.callCount, 2)
			assert.deepEqual(applyCategory_spy.firstCall.args, ['cat1', 9999])
			assert.deepEqual(applyCategory_spy.secondCall.args, ['cat2', 9999])
		})

	})

	describe('removeAll', () => {

		it('calls removeCategory for all given categories, with default force=false', () => {

			removeCategory_spy = sinon.spy()
			apply_utils.__set__('removeCategory', removeCategory_spy)

			const categories = ['cat1', 'cat2']
			removeAll = apply_utils.__get__('removeAll')
			removeAll(categories, 9999)

			assert.equal(removeCategory_spy.callCount, 2)
			assert.deepEqual(removeCategory_spy.firstCall.args, ['cat1', 9999, false])
			assert.deepEqual(removeCategory_spy.secondCall.args, ['cat2', 9999, false])
		})

		it('passes on the force argument if given', () => {

			removeCategory_spy = sinon.spy()
			apply_utils.__set__('removeCategory', removeCategory_spy)

			const categories = ['cat1', 'cat2']
			removeAll = apply_utils.__get__('removeAll')
			removeAll(categories, 9999, true)

			assert.equal(removeCategory_spy.callCount, 2)
			assert.deepEqual(removeCategory_spy.firstCall.args, ['cat1', 9999, true])
			assert.deepEqual(removeCategory_spy.secondCall.args, ['cat2', 9999, true])
		})

	})

	describe('applyCategory', function() {

		it('for all rules in the category, it calls applyRule with the same tabId', function() {
			const category = {
				rules: ['a', 'b', 'c'],
				active: true
			}
			let spy = sinon.spy()
			apply_utils.__set__('applyRule', spy)
			const applyCategory = apply_utils.__get__('applyCategory')
			applyCategory(category, 9999);
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
			const applyCategory = apply_utils.__get__('applyCategory')
			applyCategory(category, 9999);
			assert.equal(spy.callCount, 0)
		})

		it('does call applyRule if the category is not active, but the rules override', function() {
			const category = {
				rules: ['a', 'b', 'c'],
				active: false,
				overridden: true
			}
			let spy = sinon.spy()
			apply_utils.__set__('applyRule', spy)
			const applyCategory = apply_utils.__get__('applyCategory')
			applyCategory(category, 9999);
			assert.equal(spy.callCount, 3)
		})

	})

	describe('applyRule', function() {

		it('does not call anything if the rule is not active', function() {

			let applyCSS_spy = sinon.spy();
			apply_utils.__set__('applyCSS', applyCSS_spy)

			let applyHide_spy = sinon.spy();
			apply_utils.__set__('applyHide', applyHide_spy)

			const rule = {
				id: 'my-id',
				desc: 'my description',
				css: "* {color: red}",
				hide: "h3",
				active: false
			}

			let applyRule = apply_utils.__get__('applyRule')
			applyRule(rule, 9999);
			assert.equal(applyCSS_spy.callCount, 0)
			assert.equal(applyHide_spy.callCount, 0)
		})

		it('calls all relevant methods if the rule is active', function() {

			let applyCSS_spy = sinon.spy();
			apply_utils.__set__('applyCSS', applyCSS_spy)

			let applyHide_spy = sinon.spy();
			apply_utils.__set__('applyHide', applyHide_spy)

			const rule = {
				id: 'my-id',
				desc: 'my description',
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

		})

	})

	describe('removeRule', () => {

		it('does not call anything if the rule is active, and force not set', function() {

			let removeCSS_spy = sinon.spy();
			apply_utils.__set__('removeCSS', removeCSS_spy)

			let removeHide_spy = sinon.spy();
			apply_utils.__set__('removeHide', removeHide_spy)

			const rule = {
				id: 'my-id',
				desc: 'my description',
				css: "* {color: red}",
				hide: "h3",
				active: true
			}

			let removeRule = apply_utils.__get__('removeRule')
			removeRule(rule, 9999);
			assert.equal(removeCSS_spy.callCount, 0)
			assert.equal(removeHide_spy.callCount, 0)
		})

		it('calls all relevant methods if the rule is not active (force not set)', function() {

			let removeCSS_spy = sinon.spy();
			apply_utils.__set__('removeCSS', removeCSS_spy)

			let removeHide_spy = sinon.spy();
			apply_utils.__set__('removeHide', removeHide_spy)

			const rule = {
				id: 'my-id',
				desc: 'my description',
				css: "* {color: red}",
				hide: "h3",
				active: false
			}

			let removeRule = apply_utils.__get__('removeRule')
			removeRule(rule, 9999);

			assert.equal(removeCSS_spy.callCount, 1)
			assert.deepEqual(removeCSS_spy.firstCall.args, ["* {color: red}", 9999])

			assert.equal(removeHide_spy.callCount, 1)
			assert.deepEqual(removeHide_spy.firstCall.args, ["h3", 9999])

		})

		it('ignores rule status inactive if force=true', () => {
			let removeCSS_spy = sinon.spy();
			apply_utils.__set__('removeCSS', removeCSS_spy)

			let removeHide_spy = sinon.spy();
			apply_utils.__set__('removeHide', removeHide_spy)

			const rule = {
				id: 'my-id',
				desc: 'my description',
				css: "* {color: red}",
				hide: "h3",
				active: true // is active, so in principle should not remove...
			}

			let removeRule = apply_utils.__get__('removeRule')
			removeRule(rule, 9999, force=true); // but we force it to remove

			assert.equal(removeCSS_spy.callCount, 1)
			assert.deepEqual(removeCSS_spy.firstCall.args, ["* {color: red}", 9999])

			assert.equal(removeHide_spy.callCount, 1)
			assert.deepEqual(removeHide_spy.firstCall.args, ["h3", 9999])

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


		it('injects the css into the style tag if browser.tabs.removeCSS is not available',async () => {

			const insertCSS_spy = sinon.spy()
			browser_stub.tabs = {
				insertCSS: insertCSS_spy // removeCSS is undefined
			}

			const createStylesheet_spy = sinon.stub()
			createStylesheet_spy.resolves()
			apply_utils.__set__('createStylesheet', createStylesheet_spy);

			const addRuleToStylesheet_spy = sinon.spy()
			apply_utils.__set__('addRuleToStylesheet', addRuleToStylesheet_spy);

			const applyCSS = apply_utils.__get__('applyCSS');
			await applyCSS('my css', 1234)

			assert.notCalled(insertCSS_spy)
			assert.called(createStylesheet_spy)
			assert.called(addRuleToStylesheet_spy)
			assert.calledWith(createStylesheet_spy,  1234)
			assert.calledWith(addRuleToStylesheet_spy,  'my css', 1234)

		})


	})

	describe('removeCSS', () => {

		it('removes the css with browser.tabs.removeCSS if function available', () => {

			const removeCSS_spy = sinon.spy()
			browser_stub.tabs = {
				removeCSS: removeCSS_spy
			}

			const removeCSS = apply_utils.__get__('removeCSS');
			removeCSS('my css', 1234)

			assert.calledWith(removeCSS_spy,  1234, { code: "my css" })

		})

		it('removes the css via the style tag if browser.tabs.removeCSS is not available',async () => {

			browser_stub.tabs = {
				 // removeCSS is undefined
			}

			const removeRuleFromStylesheet_spy = sinon.spy()
			apply_utils.__set__('removeRuleFromStylesheet', removeRuleFromStylesheet_spy);

			const removeCSS = apply_utils.__get__('removeCSS');
			removeCSS('my css', 1234)

			assert.called(removeRuleFromStylesheet_spy)
			assert.calledWith(removeRuleFromStylesheet_spy,  'my css', 1234)

		})

	})

	describe('applyHide', () => {

		it('calls applyCSS with the appropriate css', () => {
			const applyCSS_spy = sinon.spy()
			apply_utils.__set__('applyCSS', applyCSS_spy)

			const applyHide = apply_utils.__get__('applyHide')

			applyHide('h1', 1234)

			assert.calledOnce(applyCSS_spy)
			assert.calledWith(applyCSS_spy, 'h1 { display: none; }', 1234)
		})

	})

	describe('removeHide', () => {

		it('calls removeCSS with the appropriate css', () => {
			const removeCSS_spy = sinon.spy()
			apply_utils.__set__('removeCSS', removeCSS_spy)

			const removeHide = apply_utils.__get__('removeHide')

			removeHide('h1', 1234)

			assert.calledOnce(removeCSS_spy)
			assert.calledWith(removeCSS_spy, 'h1 { display: none; }', 1234)
		})

	})

	describe('applyChanges', () => {

		it('handles a status change', () => {

			const applyChanges = apply_utils.__get__('applyChanges');
			const applyStatusChange_spy = sinon.spy()
			apply_utils.__set__('applyStatusChange', applyStatusChange_spy)

			const oldSettings = {}
			const newSettings = {_status: false}

			applyChanges('my host', oldSettings, newSettings)

			assert.calledOnce(applyStatusChange_spy)
			assert.calledWith(applyStatusChange_spy, 'my host', newSettings, {old: undefined, new: false})

		})

		it('handles a category change', () => {

			const applyChanges = apply_utils.__get__('applyChanges');
			const applyCategoryChange_spy = sinon.spy()
			apply_utils.__set__('applyCategoryChange', applyCategoryChange_spy)

			const oldSettings = {}
			const newSettings = {
				_categories: {
					related: false
				}
			}

			applyChanges('my host', oldSettings, newSettings)

			assert.calledOnce(applyCategoryChange_spy)
			assert.calledWith(applyCategoryChange_spy, 'my host', newSettings, 'related', {old: undefined, new: false})

		})

		it('does nothing on a category change when _status is false', () => {

			const applyChanges = apply_utils.__get__('applyChanges');
			const applyCategoryChange_spy = sinon.spy()
			apply_utils.__set__('applyCategoryChange', applyCategoryChange_spy)

			const oldSettings = {
				_status: false
			}
			const newSettings = {
				_status: false,
				_categories: {
					related: false
				}
			}

			applyChanges('my host', oldSettings, newSettings)
			assert.notCalled(applyCategoryChange_spy)

		})

		it('handles a rule change', () => {

			const applyChanges = apply_utils.__get__('applyChanges');
			const applyRuleChange_spy = sinon.spy()
			apply_utils.__set__('applyRuleChange', applyRuleChange_spy)

			const oldSettings = {}
			const newSettings = {
				'my-favorite-rule': false
			}

			applyChanges('my host', oldSettings, newSettings)

			assert.calledOnce(applyRuleChange_spy)
			assert.calledWith(applyRuleChange_spy, 'my host', newSettings, 'my-favorite-rule', {old: undefined, new: false})
		})

		it('does nothing on a rule change to true from undefined', () => {

			const applyChanges = apply_utils.__get__('applyChanges');
			const applyRuleChange_spy = sinon.spy()
			apply_utils.__set__('applyRuleChange', applyRuleChange_spy)

			const oldSettings = {
			}
			const newSettings = {
				'hide-related-element': true
			}

			applyChanges('my host', oldSettings, newSettings)

			assert.notCalled(applyRuleChange_spy)

		})

		it('does nothing on a rule change when _status is false', () => {

			const applyChanges = apply_utils.__get__('applyChanges');
			const applyRuleChange_spy = sinon.spy()
			apply_utils.__set__('applyRuleChange', applyRuleChange_spy)

			const oldSettings = {
				_status: false
			}
			const newSettings = {
				_status: false,
				'my-favorite-rule': false
			}

			applyChanges('my host', oldSettings, newSettings)

			assert.notCalled(applyRuleChange_spy)

		})

		it('does nothing on a rule change to true when cat status is false', () => {

			// TODO: link cat and rule!

			const applyChanges = apply_utils.__get__('applyChanges');
			const applyRuleChange_spy = sinon.spy()
			apply_utils.__set__('applyRuleChange', applyRuleChange_spy)

			const oldSettings = {
				_categories: {
					'related': false
				}
			}
			const newSettings = {
				_categories: {
					'related': false
				},
				'hide-related-element': true
			}

			applyChanges('my host', oldSettings, newSettings)

			assert.notCalled(applyRuleChange_spy)

		})

		it('does nothing on a rule change to false when cat status is false', () => {

			// TODO: link cat and rule!

			const applyChanges = apply_utils.__get__('applyChanges');
			const applyRuleChange_spy = sinon.spy()
			apply_utils.__set__('applyRuleChange', applyRuleChange_spy)

			const oldSettings = {
				_categories: {
					'related': false
				}
			}
			const newSettings = {
				_categories: {
					'related': false
				},
				'hide-related-element': false
			}

			applyChanges('my host', oldSettings, newSettings)

			assert.notCalled(applyRuleChange_spy)

		})

		it('handles a rule change to false when cat status is true (override)', () => {

			// TODO: link cat and rule!

			const applyChanges = apply_utils.__get__('applyChanges');
			const applyRuleChange_spy = sinon.spy()
			apply_utils.__set__('applyRuleChange', applyRuleChange_spy)

			const oldSettings = {
				_categories: {
					'related': true
				}
			}
			const newSettings = {
				_categories: {
					'related': true
				},
				'hide-related-element': false
			}

			applyChanges('my host', oldSettings, newSettings)

			assert.calledOnce(applyRuleChange_spy)
			assert.calledWith(applyRuleChange_spy, 'my host', newSettings, 'hide-related-element', {old: undefined, new: false})
		})

		it('handles a rule change to true when cat status is true (sanity check)', () => {

			// TODO: link cat and rule!

			const applyChanges = apply_utils.__get__('applyChanges');
			const applyRuleChange_spy = sinon.spy()
			apply_utils.__set__('applyRuleChange', applyRuleChange_spy)

			const oldSettings = {
				_categories: {
					'related': true
				},
				'hide-related-element': false
			}
			const newSettings = {
				_categories: {
					'related': true
				},
				'hide-related-element': true
			}

			applyChanges('my host', oldSettings, newSettings)

			assert.calledOnce(applyRuleChange_spy)
			assert.calledWith(applyRuleChange_spy, 'my host', newSettings, 'hide-related-element', {old: false, new: true})
		})

	})

	describe('applyStatusChange', () => {

		it('removes all rules when new status is false', async () => {

			const applyStatusChange = apply_utils.__get__('applyStatusChange')

			const getConfigMock = sinon.stub()
			const categoriesMock = sinon.stub()
			getConfigMock.resolves({categories: categoriesMock})
			apply_utils.__set__('getConfig', getConfigMock)

			const host = 'my-host.com'
			const tabId = 1234
			const browserTabsQueryMock = sinon.stub()
			browserTabsQueryMock.resolves([{id: tabId}])

			// somehow I can't get browser_stub to work here...
			const browserStub = { tabs: {
				query: browserTabsQueryMock  }
			}

			apply_utils.__set__('browser', browserStub)



			const newSettings = {
				_status: false
			}
			const status = {
				old: undefined,
				new: false
			}

			let removeAllSpy = sinon.spy();
			apply_utils.__set__('removeAll', removeAllSpy)

			await applyStatusChange(host, newSettings, status)

			assert.calledOnce(removeAllSpy)
			assert.calledWith(removeAllSpy, categoriesMock, tabId, force=true)

		})

	})

	describe('applyCategoryChange', () => {

		it('', () => {
			assert.fail('TODO')
		})

	})

	describe('applyRuleChange', () => {

		it('', () => {
			assert.fail('TODO')
		})

	})

})
