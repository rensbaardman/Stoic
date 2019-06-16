const {setup_driver} = require('../selenium_utils.js');
const {By, Key, until} = require('selenium-webdriver');

async function main() {
	let driver = await setup_driver();

	await driver.open_popup();

	await driver.mock_url('http://example.com')
	await driver.saveScreenshot('popup example.com')

	await driver.mock_url('http://my-extremely-long-incredibly-loud-very-annoying-unbelievibly-close-fake-url.com')
	await driver.saveScreenshot('popup long fake-url')

	await driver.quit()
}

main()
