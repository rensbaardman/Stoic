const expect = require('chai').expect;
const assert = require('chai').assert;
const sinon = require('sinon');
const rewire = require('rewire');

describe('url_utils', function() {

	let url_utils;
	let example_url = 'https://www.example.com/path/to/page?name=ferret&color=purple';

	beforeEach(function() {

		let query_stub = sinon.stub();
		let query_result = new Promise( (resolve, reject) => {resolve( [{url: example_url}] )} )
		query_stub.withArgs({currentWindow: true, active: true}).returns(query_result);
		let browser_stub = { tabs: { query: query_stub } }

		url_utils = rewire('../../src/utils/url_utils.js');
		url_utils.__set__('browser', browser_stub);

	})

	describe('getActiveUrl', function() {

		it('returns a Promise', function() {
			let result = url_utils.getActiveUrl();
			expect(result).to.be.an.instanceof(Promise);
		})

		it('returns the url of the active window', async function() {
			let result = await url_utils.getActiveUrl();
			expect(result).to.equal(example_url)
		})

	})

	describe('extractHostname', () => {

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
				'http://user:pass@host.com:8080/p/a/t/h?query=string#hash',
				'moz-extension://0ef765d5-7fd6-3c44-8d06-91a08c25250e/popup/popup.html',
				'http://example.org:8888/foo/bar#bang'
			];
			// TODO: consider more protocols / exceptions?
			// about acct crid data file ftp geo gopher http https info ldap mailto nfs nntp sip / sips tag tel telnet urn view-source ws / wss xmpp
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
				'localhost',
				'192.168.0.0',
				'host.com',
				'0ef765d5-7fd6-3c44-8d06-91a08c25250e',
				'example.org'
			]
			const hosts = test_urls.map(url_utils.extractHostname)
			assert.deepEqual(hosts, expected_hosts)
		})

	describe('getActiveHostname', function() {

		it('returns a Promise', function() {
			let result = url_utils.getActiveHostname();
			expect(result).to.be.an.instanceof(Promise);
		})

		it('returns the host of the active window', async function() {
			let result = await url_utils.getActiveHostname();
			expect(result).to.equal('example.com')
		})

	})

	})

})
