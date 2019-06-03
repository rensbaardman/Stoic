const popup = require('../../src/popup/popup.js');
const expect = require('chai').expect;
const assert = require('chai').assert;
const sinon = require('sinon');
const rewire = require('rewire');


describe('popup', function() {

	describe('#active_url', function() {

		let popup_rewired, example_url;

		beforeEach(function() {

			example_url = 'https://www.example.com/path/to/page?name=ferret&color=purple';

			let query_stub = sinon.stub();
			// we only give the necessary value;
			// for a complete description of the returned objects see
			// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
			// We assume that the permission 'tabs' has been requested!
			let tab_array = [{url: example_url}]
			let query_result = new Promise((resolve, reject) =>
				{resolve(tab_array)})
			query_stub.withArgs({currentWindow: true, active: true}).returns(query_result);
			let browser_stub = {
				tabs: {
					query: query_stub
				}
			}

			popup_rewired = rewire('../../src/popup/popup.js');
			popup_rewired.__set__('browser', browser_stub);
			
		})

		it('returns a Promise', function() {
			let result = popup.active_url();
			expect(result).to.be.an.instanceof(Promise);
		})

		it('returns the url of the active window', async function() {
			let result = await popup.active_url();
			expect(result).to.equal(example_url)
		})

	})

})
