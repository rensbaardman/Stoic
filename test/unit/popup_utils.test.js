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

		popup_utils = rewire('../../src/popup/js/popup_utils.js');
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

		it.skip('finish test', () => {
			assert.fail('finish test')
		})

	})

	describe('extractHost', () => {

		it('should extract the host of an url', () => {
			const test_urls = [
				'https://en.wikipedia.org/front/something.html',
				'https://en.wikipedia.org/front/something.html#subpage',
				'https://en.wikipedia.org/front/something.html#subpage?q=true&a=false',
				'http://my.favorite.page.co.uk/yes/no.php',
				'http://something-interesting.design/index',
				'http://something-interesting.design',
				'http://www.something-interesting.design', // should strip of www!
				'about:blank',
				'chrome-extension://eiimnmioipafcokbfikbljfdeojpcgbh/options.html',
				'chrome://settings/password',
				'http://localhost:8000',
				'http://192.168.0.0:81', // we use :81, because else default ports (e.g. :80) are turned into empty url.host
				'http://user:pass@host.com:8080/p/a/t/h?query=string#hash'
			];
			const expected_hosts = [
				'en.wikipedia.org',
				'en.wikipedia.org',
				'en.wikipedia.org',
				'my.favorite.page.co.uk',
				'something-interesting.design',
				'something-interesting.design',
				'something-interesting.design',
				'about:blank',
				'eiimnmioipafcokbfikbljfdeojpcgbh',
				'settings',
				'localhost:8000',
				'192.168.0.0:81',
				'host.com:8080'
			]
			const hosts = test_urls.map(popup_utils.extractHost)
			assert.deepEqual(hosts, expected_hosts)
		})

	})

})
