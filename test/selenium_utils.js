const fs = require('fs');
const mkdirp = require('mkdirp');
const gm = require('gm').subClass({imageMagick: true});

const {Builder, By, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');

const package = require('../package.json');

function file_to_buffer(path) {
	let file = fs.readFileSync(path);
	return Buffer.from(file).toString('base64');
}

let firefox_options = new firefox.Options();
// TODO find a way to load unsigned extensions as temporary extensions in default Firefox
// see https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox
// cf what web-ext does
// cf this issue (undocumented commands?)
// https://github.com/mozilla/geckodriver/issues/473
firefox_options
	.addExtensions(`build/${package.name}-${package.version}-firefox.xpi`)
	.setBinary(firefox.Channel.AURORA)
	.setPreference('xpinstall.signatures.required', false)

let chrome_options = new chrome.Options();
chrome_options
	// removes the 'Chrome is being controlled by automated test software'-warning
	// via https://sqa.stackexchange.com/a/26120
	.addArguments("disable-infobars");

// Since chrome_options takes the _file_ of the
// extension itself, we have to consider the case
// where we are building and then testing Firefox
// first, and the build for Chrome is not yet available.
// This workaround considers that case, but unfortunately
// we now exports different chrome_options depending
// on the env variable SELENIUM_BROWSER...
// TODO: why is it not possible to take the file name of the extension,
// as we do with Firefox and is possible according to the docs?
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/chrome_exports_Options.html
const target = process.env.SELENIUM_BROWSER;
if (target === 'chrome') {
	chrome_options.addExtensions(file_to_buffer(`build/${package.name}-${package.version}-chrome.crx`))
}

// we could also get this from the environment variable
// SELENIUM_BROWSER
async function get_browser_name() {

	if (this.browser_name !== undefined) {
		return this.browser_name
	}

	let capabilities = await this.getCapabilities()
	this.browser_name = capabilities.getBrowserName();
	return this.browser_name
}

async function get_browser_version() {

	if (this.browser_version !== undefined) {
		return this.browser_version
	}

	let capabilities = await this.getCapabilities()
	this.browser_version = capabilities.getBrowserVersion();
	return this.browser_version
}

async function get_extension_id() {

	// we manually open the addons/extensions page,
	// and find the url there. This is hacky, but seems to work
	// quite well.
	// If the extension has been published, this ID is usually set by
	// the store (I think that is at least what Chrome does), but
	// we shouldn't assume this. Also, Firefox's internal ID might be
	// different.

	// after we did this once, we save the extension_id
	if (this.extension_id !== undefined) {
		return this.extension_id
	}

	let browser_name = await this.get_browser_name();
	let browser_version = await this.get_browser_version()

	if (browser_name === 'firefox') {

		// TODO: the manifest ID Stoic@rensbaardman.nl gets injected in build_manifest() in webpack.config.js;
		// try to get that one out (or at least move to manifest.json or something like APP_INFO)
		let element;

		// new addon page url scheme starting from 68.0
		if (browser_version >= '68.0') {
			await this.open_in_new_tab('about:debugging#/runtime/this-firefox')
			// this is XPATH for:
			// get dd with text ...
			// then twice up a layer ('/..' is parent)
			// then the second div
			// and then dd
			element = await this.wait(until.elementLocated(By.xpath('//dd[text()="Stoic@rensbaardman.nl"]/../..//div[2]/dd')), 2000);

		}
		else {
			await this.open_in_new_tab('about:debugging#addons');
			element = await this.findElement(By.css('li[data-addon-id="Stoic@rensbaardman.nl"] dd.internal-uuid span:first-child'))
		}

		let id = await element.getAttribute('innerHTML');
		await this.safe_close_current_window();
		// save it so we don't have to go through this all later on
		this.extension_id = id;
		return this.extension_id

	} else if (browser_name === 'chrome') {
	
		await this.open_in_new_tab('chrome://extensions/');

		let extensions_manager    = await this.findElement(By.css('extensions-manager'));
		let extensions_manager_SR = await this.get_shadow_root(extensions_manager);
		let extension_list        = await extensions_manager_SR.findElement(By.css('#viewManager extensions-item-list'));
		let extension_list_SR     = await this.get_shadow_root(extension_list)
		let extensions            = await extension_list_SR.findElements(By.css('#container extensions-item'));

		// there are probably multiple extensions installed, so we have to find the right one
		for (let i = 0; i < extensions.length; i++) {
			let extension = extensions[i]
			let extension_SR = await this.get_shadow_root(extension)
			let name_element = await extension_SR.findElement(By.css('#name'))
			let ext_name = await name_element.getText()

			// 'name' is extracted from package.json
			if (ext_name === package.name) {
				let id = await extension.getAttribute('id');
				await this.safe_close_current_window();
				// save it so we don't have to go through this all later on
				this.extension_id = id;
				return this.extension_id;
			}
		}
	} else {
		throw new Error('Expected "chrome" or "firefox" as webdriver')
	}
}

function get_shadow_root(element) {
	return this.executeScript("return arguments[0].shadowRoot", element);
}

async function get_extension_base_url() {

	if (this.extension_base_url !== undefined) { return this.extension_base_url; }

	let browser_name = await this.get_browser_name();
	let id = await this.get_extension_id()

	if (browser_name === 'firefox') {
		return `moz-extension://${id}`
	} else if (browser_name === 'chrome') {
		return `chrome-extension://${id}`
	} else {
		throw new Error('Expected "chrome" or "firefox" as webdriver')
	}
}

async function get_extension_relative_url(relative_path) {
	let base_url = await this.get_extension_base_url();
	return `${base_url}/${relative_path}`
}

async function get_popup_url() {
	if (this.popup_url !== undefined) { return this.popup_url; }
	this.popup_url = await this.get_extension_relative_url('popup/popup.html')
	return this.popup_url
}

async function get_background_page_url() {
	if (this.background_page_url !== undefined) { return this.background_page_url }
	this.background_page_url = await this.get_extension_relative_url('_generated_background_page.html')
	return this.background_page_url
}

// TODO: this could be done cleaner with sending 'COMMAND/CONTROL + t', but apparently doesn't work. See https://stackoverflow.com/a/41974917/7770056
// or checkout actions: https://club.ministryoftesting.com/t/how-to-open-new-tab-in-chrome-and-firefox/12569/2
async function open_in_new_tab(url) {
	await this.executeScript('window.open("about:blank");');
	const handles = await this.getAllWindowHandles();
	const new_window_handle = handles[handles.length - 1];
	await this.switchTo().window(new_window_handle);
	return this.get(url);
}

async function open_popup() {
	const popup_url = await this.get_popup_url()
	await this.get(popup_url)
	// allow handlers to settle
	return this.sleep(200)
}

async function safe_close_window(handle) {
	// closes window and shifts focus
	// to previous in list,
	// or if it is the last, changes it to about:blank
	// to prevent session from closing

	const handles = await this.getAllWindowHandles();
	const index = handles.indexOf(handle);
	if (index === -1) {
		throw new Error('handle does not belong to existing window')
	} else if (index === 0) {
		// this means it is the most left window,
		// then change to window at the right from it
		// (note that we have to make sure it exists!)
		var next_focus_index = 1;
	}
	else {
		var next_focus_index = index - 1;
	}

	if (handles.length === 1) {
		// only 1 window open

		// cannot assume that this window is already active
		await this.switchTo().window(handle);
		return this.get('about:blank');
	}
	else {
		await this.switchTo().window(handle);
		await this.close();
		return this.switchTo().window(handles[next_focus_index]); 
	}

}

async function safe_close_current_window() {
	const current_handle = await this.getWindowHandle();
	return this.safe_close_window(current_handle)
}

async function safe_close_all_windows() {
	// TODO: can do this more efficiently by closing N-1
	// windows the 'unsafe' way, and then 'safe_closing'
	// the last one
	const handles = await this.getAllWindowHandles();
	for (let handle of handles) {
		await this.safe_close_window(handle)
	}
}

async function mock_url(url) {

	let current_url = await this.getCurrentUrl();
	let popup_url = await this.get_popup_url();

	// safety check: only apply in the popup, since else
	// browser is undefined
	if (current_url === popup_url) {

		// API: see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/Tabs/onUpdated
		const tabId = 0 // some fake tabId.
		const changeInfo = { url: url} // could add more attributes, but not necessary for now
		const tab = { active: true } // could add more attributes, but not necessary for now

		// clone old browser.tabs.query to our namespace,
		// mock the relevant part of browser.tabs.query,
		// then activate all handlers as if the url was
		// really changed.
		const script = `
			var _selenium = { browser: { tabs: { query: browser.tabs.query.bind({}) }}};
			browser.tabs.query = function(queryInfo) {
				if (queryInfo = {currentWindow: true, active: true}) {
					return new Promise( (resolve, reject) => {resolve([{url: '${url}'}])});
				}
				else {
					return _selenium.browser.tabs.query(queryInfo)
				}
			};
			for (let listener of bundle.tabOnUpdatedListeners) {
				if (browser.tabs.onUpdated.hasListener(listener)) {
					listener(${tabId}, ${JSON.stringify(changeInfo)}, ${JSON.stringify(tab)})
				}
			}`
		await this.executeScript(script)
		// not pretty, but makes a whole lot of tests more stable.
		// Apparently this.executeScript returns before the script
		// has actually fully executed. Or at least before
		// all consequences have been followed.
		return this.sleep(1000)
	}
	else {
		throw new Error(`url can only be mocked within the popup, current_url is: ${current_url}`)
	}

}

async function reset_extension_storage() {
	// we use the background url, on not the popup url,
	// since this is cleaner (and popup might not be available in other)
	// situations
	const background_url = this.get_background_page_url();
	await this.open_in_new_tab(background_url);

	const script = 'browser.storage.local.clear();'
	await this.executeScript(script);

	return this.safe_close_current_window();
}

async function saveScreenshot(description) {

	// TODO: consider from where the path should resolve?
	const filedir = `test/visual/screenshots/${package.name}-${package.version}`;
	// somehow needs this extra '/' at the end - docs say otherwise
	await mkdirp(`${filedir}/`, (err) => {
		if (err) throw err;
	});

	const browser_name = await this.get_browser_name();
	let browser_abbr;
	if (browser_name === 'firefox') {
		browser_abbr = 'FF'
	}
	else if (browser_name === 'chrome') {
		browser_abbr = 'GC'
	}

	const {extractHost} = require('../src/utils/url_utils.js')
	const url = await this.getCurrentUrl();
	let host;
	if (url.startsWith('moz-extension://') || url.startsWith('chrome-extension://')) {
		host = 'POP'
	} else {
		let host = extractHost(url)
	}

	const safe_description = description.replace(/[:\/\s]/g, '-')

	let filename;
	if (description === undefined) {
		filename = `${browser_abbr}-${host}`
	} else {
		filename = `${browser_abbr}-${host}-${safe_description}`
	}

	const filepath = `${filedir}/${filename}.png`;

	// returns a base-64 encoded PNG
	let screenshot = await this.takeScreenshot()

	// get bodysize to crop perfectly
	const body = await this.findElement(By.css('body'))
	const size = await body.getRect();

	gm(Buffer.from(screenshot, 'base64'))
		.crop(size.width, size.height, 0, 0)
		.write(filepath, (err) => {
			if (err) throw err;
			return;
		});

}


class ExtendedBuilder extends Builder {

	async build() {
		let driver = await super.build();
		driver.get_browser_name = get_browser_name;
		driver.get_browser_version = get_browser_version;
		driver.get_extension_id = get_extension_id;
		driver.get_shadow_root = get_shadow_root;
		driver.get_extension_base_url = get_extension_base_url;
		driver.get_extension_relative_url = get_extension_relative_url;
		driver.get_popup_url = get_popup_url;
		driver.get_background_page_url = get_background_page_url;
		driver.open_in_new_tab = open_in_new_tab;
		driver.open_popup = open_popup;
		driver.safe_close_window = safe_close_window;
		driver.safe_close_current_window = safe_close_current_window;
		driver.safe_close_all_windows = safe_close_all_windows;
		driver.mock_url = mock_url;
		driver.reset_extension_storage = reset_extension_storage;
		driver.saveScreenshot = saveScreenshot;
		return driver;
	}

}

function setup_driver() {
	return new ExtendedBuilder()
		.setFirefoxOptions(firefox_options)
		.setChromeOptions(chrome_options)
		.build();
}

module.exports = {
	setup_driver: setup_driver
}
