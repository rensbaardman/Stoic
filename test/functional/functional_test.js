let fs = require('fs');

var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;

const {Builder, By, Key, until} = require('selenium-webdriver');
let firefox = require('selenium-webdriver/firefox');
let chrome = require('selenium-webdriver/chrome');

let package = require('../../package.json');
let name = package.name
let version = package.version


function file_to_buffer(file) {
	var file = fs.readFileSync(file);
	return Buffer.from(file).toString('base64');
}

firefox_options = new firefox.Options();
// TODO find a way to load unsigned extensions as temporary extensions in default Firefox
// see https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox
// cf what web-ext does
// cf this issue (undocumented commands?)
// https://github.com/mozilla/geckodriver/issues/473
firefox_options
	.addExtensions(`build/${name}-${version}-firefox.xpi`)
	.setBinary(firefox.Channel.AURORA)
	.setPreference('xpinstall.signatures.required', false)

chrome_options = new chrome.Options();
chrome_options
	.addExtensions(file_to_buffer(`build/${name}-${version}-chrome.crx`))
	// removes the 'Chrome is being controlled by automated test software'-warning
	// via https://sqa.stackexchange.com/a/26120
	.addArguments("disable-infobars");


async function test() {
	driver = await new Builder()
		.setFirefoxOptions(firefox_options)
		.setChromeOptions(chrome_options)
		.build();

	open_popup_page(driver)

	// driver.quit()
}

function get_shadow_root(driver, element) {
	return driver.executeScript("return arguments[0].shadowRoot", element);
}

async function get_extension_id(driver) {

	// we manually open the addons/extensions page,
	// and find the url there. This is hacky, but seems to work
	// quite well.
	// If the extension has been published, this ID is usually set by
	// the store (I think that is at least what Chrome does), but
	// we shouldn't assume this. Also, Firefox's internal ID might be
	// different.

	let browser_name = await get_browser_name(driver);

	if (browser_name === 'firefox') {
		await driver.get('about:debugging#addons')
		// TODO: the manifest ID Stoic@rensbaardman.nl gets injected in build_manifest() in webpack.config.js;
		// try to get that one out (or at least move to manifest.json or something like APP_INFO)
		let element = await driver.findElement(By.css('li[data-addon-id="Stoic@rensbaardman.nl"] dd.internal-uuid span:first-child'))
		return element.getAttribute('innerHTML')
	} else if (browser_name === 'chrome') {
	
		await driver.get('chrome://extensions/')

		let extensions_manager    = await driver.findElement(By.css('extensions-manager'));
		let extensions_manager_SR = await get_shadow_root(driver, extensions_manager);
		let extension_list        = await extensions_manager_SR.findElement(By.css('#viewManager extensions-item-list'));
		let extension_list_SR     = await get_shadow_root(driver, extension_list)
		let extensions            = await extension_list_SR.findElements(By.css('#container extensions-item'));

		for (var i = 0; i < extensions.length; i++) {
			let extension = extensions[i]
			let extension_SR = await get_shadow_root(driver, extension)
			let name_element = await extension_SR.findElement(By.css('#name'))
			let ext_name = await name_element.getText()

			if (ext_name === name) {
				return extension.getAttribute('id')
			}
		}
	} else {
		throw new Error('Expected "chrome" or "firefox" as webdriver')
	}
}

async function get_extension_base_url(driver, id) {

	let browser_name = await get_browser_name(driver);

	if (browser_name === 'firefox') {
		return `moz-extension://${id}`
	} else if (browser_name === 'chrome') {
		return `chrome-extension://${id}`
	} else {
		throw new Error('Expected "chrome" or "firefox" as webdriver')
	}
}

async function open_popup_page(driver) {

	let id = await get_extension_id(driver)
	let base_url = await get_extension_base_url(driver, id)
	let url = `${base_url}/popup/popup.html`
	return driver.get(url)

}

async function get_browser_name(driver) {
	let capabilities = await driver.getCapabilities()
	return capabilities.get('browserName')
}



describe(`${name}`, function() {

	this.timeout(10000);

	var driver;

	before(async function() {
		driver = await new Builder()
			.setFirefoxOptions(firefox_options)
			.setChromeOptions(chrome_options)
			.build();	
	})

	after(async function() {
		await driver.quit()
	})

	describe('popup', function() {

		it('should say "Hello World!', async function() {

			await open_popup_page(driver);

			let header = await driver.findElement(By.css('h1'));
			let text = await header.getText();

			expect(text).to.equal('Hello World')

		})

	})

})
