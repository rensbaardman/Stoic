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

		it('returns a promise', () => {
			storage_get_stub.withArgs().resolves({ 'some-key': { _status: 'whatever'}})
			const response = storage_utils.getHostStatus('some-key')
			assert.instanceOf(response, Promise);
		})

		it('returns true for non-existing keys', async () => {
			const expected_arg = { 'non-existing-key.com': { '_status': true }}
			storage_get_stub.withArgs(expected_arg).resolves(expected_arg);
			const status = await storage_utils.getHostStatus('non-existing-key.com')
			assert.equal(status, true)
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
			const expected_arg = { 'some-existing-key.com': { '_status': true }}
			storage_get_stub.withArgs(expected_arg).resolves(response);
			const status = await storage_utils.getHostStatus('some-existing-key.com')
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
						'status': true
					}
				}
			}
			storage_get_stub.resolves(settings)
			await storage_utils.setHostStatus('some-example-host.com', false)
			settings['some-example-host.com']['_status'] = false;
			assert.calledWith(storage_set_stub, settings)
		})

	})

})
