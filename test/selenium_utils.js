const fs = require('fs');

const {By} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');

const package = require('../package.json');
const name = package.name
const version = package.version


function file_to_buffer(path) {
	let file = fs.readFileSync(path);
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
		await console.log('its firefox')
		await open_in_new_tab(driver, 'about:debugging#addons');
		await console.log('opened in new tab')
		// TODO: the manifest ID Stoic@rensbaardman.nl gets injected in build_manifest() in webpack.config.js;
		// try to get that one out (or at least move to manifest.json or something like APP_INFO)
		let element = await driver.findElement(By.css('li[data-addon-id="Stoic@rensbaardman.nl"] dd.internal-uuid span:first-child'))
		let id = await element.getAttribute('innerHTML');
		await safe_close_current_window(driver);
		return id;
	} else if (browser_name === 'chrome') {
	
		await open_in_new_tab(driver, 'chrome://extensions/')

		let extensions_manager    = await driver.findElement(By.css('extensions-manager'));
		let extensions_manager_SR = await get_shadow_root(driver, extensions_manager);
		let extension_list        = await extensions_manager_SR.findElement(By.css('#viewManager extensions-item-list'));
		let extension_list_SR     = await get_shadow_root(driver, extension_list)
		let extensions            = await extension_list_SR.findElements(By.css('#container extensions-item'));

		// there are probably multiple extensions installed, so we have to find the right one
		for (let i = 0; i < extensions.length; i++) {
			let extension = extensions[i]
			let extension_SR = await get_shadow_root(driver, extension)
			let name_element = await extension_SR.findElement(By.css('#name'))
			let ext_name = await name_element.getText()

			if (ext_name === name) {
				let id = await extension.getAttribute('id');
				await safe_close_current_window(driver);
				return extension.getAttribute('id');
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

async function get_popup_url(driver) {
	let id = await get_extension_id(driver)
	let base_url = await get_extension_base_url(driver, id)
	let url = `${base_url}/popup/popup.html`
	return url	
}

// we could also get this from the environment variable
// SELENIUM_BROWSER
async function get_browser_name(driver) {
	let capabilities = await driver.getCapabilities()
	return capabilities.get('browserName')
}

// TODO: this could be done cleaner with sending 'COMMAND/CONTROL + t', but apparently doesn't work. See https://stackoverflow.com/a/41974917/7770056
// or checkout actions: https://club.ministryoftesting.com/t/how-to-open-new-tab-in-chrome-and-firefox/12569/2
async function open_in_new_tab(driver, url) {
	await driver.executeScript('window.open("about:blank");');
	const handles = await driver.getAllWindowHandles();
	const new_window_handle = handles[handles.length - 1];
	await driver.switchTo().window(new_window_handle);
	return driver.get(url);
}

async function safe_close_window(driver, handle) {
	// closes window and shifts focus
	// to previous in list,
	// or if it is the last, changes it to about:blank
	// to prevent session from closing

	const handles = await driver.getAllWindowHandles();
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
		await driver.switchTo().window(handle);
		return driver.get('about:blank');
	}
	else {
		await driver.switchTo().window(handle);
		await driver.close();
		return driver.switchTo().window(handles[next_focus_index]); 
	}

}

async function safe_close_current_window(driver) {
	const current_handle = await driver.getWindowHandle();
	return safe_close_window(driver, current_handle)
}


module.exports = {
	firefox_options: firefox_options,
	chrome_options: chrome_options,
	get_popup_url: get_popup_url,
	get_browser_name: get_browser_name,
	open_in_new_tab: open_in_new_tab,
	safe_close_window: safe_close_window
}
