const expect = require('chai').expect;
const assert = require('chai').assert;
const sinon = require('sinon');
// add sinon assertions to chai
sinon.assert.expose(assert, { prefix: "" });
const rewire = require('rewire');

describe('storage_utils', function() {

	let storage_utils;
	let storage_get_stub;
	let storage_set_stub;

	beforeEach(function() {

		storage_get_stub = sinon.stub();
		storage_set_stub = sinon.stub();
		let browser_stub = { storage: { local: { get: storage_get_stub, set:  storage_set_stub} } }

		storage_utils = rewire('../../src/utils/storage_utils.js');
		storage_utils.__set__('browser', browser_stub);

	})

	describe('getHostStatus', () => {

		it('returns the default for settings without _status', () => {
			const defaults = require('../../src/utils/defaults.js')
			const status = storage_utils.getHostStatus({})
			assert.equal(status, defaults.SITE_STATUS)
		})

		it('returns _status for settings that do have _status', async () => {
			const settings = {
				'_status': false,
				'_categories': {
					'mumbo': 'jumbo'
				},
				'something': true
			}
			const status = storage_utils.getHostStatus(settings)
			assert.equal(status, false)
		})

	})

	describe('setHostStatus', () => {

		it('returns an empty promise', async () => {
			storage_get_stub.resolves({'some-example-host.com': {}})
			const response = storage_utils.setHostStatus('some-example-host.com', 'whatever')
			assert.instanceOf(response, Promise);
			const content = await response;
			assert.equal(content, undefined)
		})

		it('saves the new status in storage', async () => {
			let settings = {
				'some-example-host.com': {
				}
			}
			storage_get_stub.resolves(settings)
			await storage_utils.setHostStatus('some-example-host.com', false)
			assert.calledWith(storage_set_stub, {
				'some-example-host.com': {
					_status: false,
				}
			})
		})

		it('does not delete previous data for the host', async () => {
			let settings = {
				'some-example-host.com': {
					'my-rule': false,
					'other-rule': true,
					'_categories': {
						'logo': false,
						'stats': true
					}
				}
			}
			storage_get_stub.resolves(settings)
			await storage_utils.setHostStatus('some-example-host.com', false)
			settings['some-example-host.com']['_status'] = false;
			assert.calledWith(storage_set_stub, settings)
		})

	})

	describe('getCategoryStatus', () => {

		it('returns a promise', () => {
			const settings = { 'some-key': { '_categories': { 'related': true }}}
			storage_get_stub.resolves(settings)
			const response = storage_utils.getCategoryStatus('some-key', 'related')
			assert.instanceOf(response, Promise);
		})

		it('returns true for non-existing keys', async () => {
			const expected_arg = { 'non-existing-key.com': { '_categories': { 'related': true }}}
			storage_get_stub.withArgs(expected_arg).resolves(expected_arg);
			const status = await storage_utils.getCategoryStatus('non-existing-key.com', 'related')
			assert.equal(status, true)
		})

		it('returns saved value for existing keys', async () => {
			const response = {
				'some-existing-key.com': {
					'_status': false,
					'my-rule': true,
					'my-other-rule': false,
					'_categories': {
						'related': false,
						'social': true
					}
				}
			}
			const expected_arg = { 'some-existing-key.com': { '_categories': { 'related': true }}}
			storage_get_stub.withArgs(expected_arg).resolves(response);
			const status = await storage_utils.getCategoryStatus('some-existing-key.com', 'related')
			assert.equal(status, false)
		})

	})

	describe('setCategoryStatus', () => {

		it('returns an empty promise', async () => {
			storage_get_stub.resolves({'some-example-host.com': {} })
			const response = storage_utils.setCategoryStatus('some-example-host.com', 'related', true)
			assert.instanceOf(response, Promise);
			const content = await response;
			assert.equal(content, undefined)
		})

		it('saves the new status in storage', async () => {
			let settings = {
				'some-example-host.com': {
				}
			}
			storage_get_stub.resolves(settings)
			await storage_utils.setCategoryStatus('some-example-host.com', 'related', false)
			assert.calledWith(storage_set_stub, {
				'some-example-host.com': {
					_categories: {
						'related': false
					}
				}
			})
		})

		it('does not delete previous data for the host', async () => {
			let settings = {
				'some-example-host.com': {
					'my-rule': false,
					'other-rule': true,
					'_categories': {
						'logo': false,
						'stats': true
					}
				}
			}
			storage_get_stub.resolves(settings)
			await storage_utils.setCategoryStatus('some-example-host.com', 'stats', false)
			settings['some-example-host.com']['_categories']['stats'] = false;
			assert.calledWith(storage_set_stub, settings)
		})

	})

	describe('getSettings', () => {

		it('returns a promise', () => {
			const settings = { 'some-key': { }}
			storage_get_stub.resolves(settings)
			const response = storage_utils.getSettings('some-key')
			assert.instanceOf(response, Promise);
		})

		it('returns an empty object (with _categories) for non-existing keys', async () => {
			const expected_arg = { 'non-existing-key.com': {}}
			storage_get_stub.withArgs(expected_arg).resolves(expected_arg);
			const settings = await storage_utils.getSettings('non-existing-key.com')
			assert.deepEqual(settings, {'_categories': {}})
		})

		it('returns saved value for existing keys', async () => {
			const response = {
				'some-existing-key.com': {
					'_status': false,
					'my-rule': true,
					'my-other-rule': false,
					'_categories': {
						'logo': false,
						'social': true
					}
				}
			}
			const expected_arg = { 'some-existing-key.com': { }}
			storage_get_stub.withArgs(expected_arg).resolves(response);
			const settings = await storage_utils.getSettings('some-existing-key.com')
			assert.equal(settings, response['some-existing-key.com'])
		})

		it("adds '_categories' if necessary", async () => {
			let response = {
				'some-existing-key.com': {
					'_status': false,
					'my-rule': true,
					'my-other-rule': false
				}
			}
			const expected_arg = { 'some-existing-key.com': { } }
			storage_get_stub.withArgs(expected_arg).resolves(response);
			const settings = await storage_utils.getSettings('some-existing-key.com')
			response['some-existing-key.com']['_categories'] = {}
			assert.equal(settings, response['some-existing-key.com'])
		})

	})


})
