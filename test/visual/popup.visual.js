const {setup_driver} = require('../selenium_utils.js');
const {By, Key, until} = require('selenium-webdriver');
const fs = require('fs');
const mkdirp = require('mkdirp');
const package = require('../../package.json');


async function take_screenshot_popup(driver) {
	let popup_url = await driver.get_popup_url();
	await driver.get(popup_url)
	let browser_name = await driver.get_browser_name();
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
