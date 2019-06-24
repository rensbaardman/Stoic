const {setup_driver} = require('../utils/selenium_utils.js');
const {By, Key, until} = require('selenium-webdriver');

async function main() {
	let driver = await setup_driver();

	await driver.open_popup();


	await driver.mock_url('http://example.com')
	await driver.saveScreenshot('example.com')

	let label = await driver.wait(until.elementLocated(By.css('label[for="toggle-status"]')));
	// toggle to 'disabled'
	await label.click();
	await driver.saveScreenshot('disabled')
	await label.click();

	let related_label = await driver.wait(until.elementLocated(By.css('label[for="toggle-cat-related"]')))
	await related_label.click();
	await driver.saveScreenshot('category disabled')


	await driver.mock_url('http://my-extremely-long-incredibly-loud-very-annoying-unbelievibly-close-fake-url.com')
	await driver.saveScreenshot('long fake-url')

	await driver.quit()
}

main()
