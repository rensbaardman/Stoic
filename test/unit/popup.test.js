const popup = require('../../src/popup/popup.js');
const expect = require('chai').expect;
const assert = require('chai').assert;


describe('popup', function() {

	describe('#get_active_url', function() {

		it('returns a Promise', function() {
			let result = popup.active_url();
			expect(result).to.be.an.instanceof(Promise);
		})

		it('returns the url of the active window', async function() {
			let result = await popup.active_url();
			assert.fail('finish the test - have to stub the browser-API!');
		})

	})


})