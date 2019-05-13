const {firefox_options, chrome_options, open_popup_page, get_browser_name} = require('../selenium_utils.js');
const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require('fs');
const mkdirp = require('mkdirp');
const package = require('../../package.json');

async function setup_driver() {
	let driver = await new Builder()
		.setFirefoxOptions(firefox_options)
		.setChromeOptions(chrome_options)
		.build();
	return driver;
}

async function take_screenshot_popup(driver) {
	await open_popup_page(driver);
	let browser_name = await get_browser_name(driver);
	let screenshot = await driver.takeScreenshot()
	return [screenshot, browser_name, 'popup init']
}

async function save_screenshot([screenshot, browser_name, image_desc]) {

	const version = package.version;
	const name = package.name;
	const filedir = `test/visual/screenshots/${name}-${version}`;
	const filepath = `${filedir}/${version}-${browser_name}-${image_desc.replace(' ', '_')}.png`;

	// somehow needs this extra '/' at the end - docs say otherwise
	await mkdirp(`${filedir}/`, (err) => {
		if (err) throw err;
		console.log(`created directory ${filedir}`)
	});

	// driver.takeScreenshot() returns a base-64 encoded PNG
	fs.writeFile(filepath, screenshot, {encoding: 'base64'}, (err) => {
		if (err) throw err;
	});
}

async function main() {
	let driver = await setup_driver();

	await take_screenshot_popup(driver).then(save_screenshot)

	driver.quit()
}

main()