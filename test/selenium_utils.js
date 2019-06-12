const fs = require('fs');

const {Builder, By} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');

const package = require('../package.json');
const name = package.name
const version = package.version


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
	.addExtensions(`build/${name}-${version}-firefox.xpi`)
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
const target = process.env.SELENIUM_BROWSER;
if (target === 'chrome') {
	chrome_options.addExtensions(file_to_buffer(`build/${name}-${version}-chrome.crx`))
}

// we could also get this from the environment variable
// SELENIUM_BROWSER
async function get_browser_name() {
	let capabilities = await this.getCapabilities()
	return capabilities.get('browserName')
}

async function get_extension_id() {

	// we manually open the addons/extensions page,
	// and find the url there. This is hacky, but seems to work
	// quite well.
	// If the extension has been published, this ID is usually set by
	// the store (I think that is at least what Chrome does), but
	// we shouldn't assume this. Also, Firefox's internal ID might be
	// different.

	let browser_name = await this.get_browser_name();

	if (browser_name === 'firefox') {
		await this.open_in_new_tab('about:debugging#addons');
		// TODO: the manifest ID Stoic@rensbaardman.nl gets injected in build_manifest() in webpack.config.js;
		// try to get that one out (or at least move to manifest.json or something like APP_INFO)
		let element = await this.findElement(By.css('li[data-addon-id="Stoic@rensbaardman.nl"] dd.internal-uuid span:first-child'))
		let id = await element.getAttribute('innerHTML');
		await this.safe_close_current_window();
		return id;
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
			if (ext_name === name) {
				let id = await extension.getAttribute('id');
				await this.safe_close_current_window();
				return id;
			}
		}
	} else {
		throw new Error('Expected "chrome" or "firefox" as webdriver')
	}
}

function get_shadow_root(element) {
	return this.executeScript("return arguments[0].shadowRoot", element);
}

async function get_extension_base_url(id) {

	let browser_name = await this.get_browser_name();

	if (browser_name === 'firefox') {
		return `moz-extension://${id}`
	} else if (browser_name === 'chrome') {
		return `chrome-extension://${id}`
	} else {
		throw new Error('Expected "chrome" or "firefox" as webdriver')
	}
}

async function get_popup_url() {
	let id = await this.get_extension_id()
	let base_url = await this.get_extension_base_url(id)
	let url = `${base_url}/popup/popup.html`
	return url	
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


class ExtendedBuilder extends Builder {

	async build() {
		let driver = await super.build();
		driver.get_browser_name = get_browser_name;
		driver.get_extension_id = get_extension_id;
		driver.get_shadow_root = get_shadow_root;
		driver.get_extension_base_url = get_extension_base_url;
		driver.get_popup_url = get_popup_url;
		driver.open_in_new_tab = open_in_new_tab;
		driver.safe_close_window = safe_close_window;
		driver.safe_close_current_window = safe_close_current_window;
		driver.safe_close_all_windows = safe_close_all_windows;
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
