const {By, until} = require('selenium-webdriver');
const {setup_driver} = require('../utils/selenium_utils.js');
const {createTestServer} = require('../utils/server_utils.js')
const {assert} = require('chai');


describe('background', function() {

	this.timeout(10000);
	this.slow(2000);

	var driver;
	var server;

	before(async function() {
		driver = await setup_driver();
		server = createTestServer().listen(8080)
	})

	afterEach(async function() {
		await driver.reset_extension_storage();
		await driver.safe_close_all_windows();
	})

	after(async function() {
		server.close()
		await driver.quit()
	})

	describe('initial load', () => {

		it('applies all css rules to the page, when no settings active', async () => {
			await driver.get('http://earth.test:8080')

			const logo = await driver.findElement(By.css('#logo'))
			let display_status = await logo.isDisplayed()
			assert.equal(display_status, false)

			const related = await driver.findElement(By.css('#related'))
			display_status = await related.isDisplayed()
			assert.equal(display_status, false)
		})

		it.skip('check the settings to determine which css rules to apply', async () => {
			assert.fail('to finish')
		})

	})

})
