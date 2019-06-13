const {setup_driver} = require('../selenium_utils.js');
const {By, Key, until} = require('selenium-webdriver');

async function main() {
	let driver = await setup_driver();

	await driver.open_popup();
	await driver.saveScreenshot('popup init')

	await driver.mock_url('http://fake-url.com')
	await driver.saveScreenshot('popup fake-url')

	await driver.quit()
}

main()
