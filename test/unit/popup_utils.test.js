const expect = require('chai').expect;
const assert = require('chai').assert;
const sinon = require('sinon');
const rewire = require('rewire');

describe('popup_utils', function() {

	let popup_utils;
	let example_url = 'https://www.example.com/path/to/page?name=ferret&color=purple';

	beforeEach(function() {

		let query_stub = sinon.stub();
		let query_result = new Promise( (resolve, reject) => {resolve( [{url: example_url}] )} )
		query_stub.withArgs({currentWindow: true, active: true}).returns(query_result);
		let browser_stub = { tabs: { query: query_stub } }

		popup_utils = rewire('../../src/popup/popup_utils.js');
		popup_utils.__set__('browser', browser_stub);

	})

	describe('getActiveUrl', function() {

		it('returns a Promise', function() {
			let result = popup_utils.getActiveUrl();
			expect(result).to.be.an.instanceof(Promise);
		})

		it('returns the url of the active window', async function() {
			let result = await popup_utils.getActiveUrl();
			expect(result).to.equal(example_url)
		})

	})

	describe('updatePopupUrl', function() {

		it('finish test', () => {
			assert.fail('finish test')
		})

	})

})
