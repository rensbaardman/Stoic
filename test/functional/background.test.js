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
			await driver.sleep(200) // allow background script to do its work

			const logo = await driver.findElement(By.css('#logo'))
			let display_status = await logo.isDisplayed()
			assert.equal(display_status, false)

			const related = await driver.findElement(By.css('#related'))
			display_status = await related.isDisplayed()
			assert.equal(display_status, false)
		})

		it('checks the settings to determine which css rules to apply', async () => {

			const settings = {
				"earth.test": {
					_categories: {
						related: false
					},
					"hide-stats": false
				}
			}

			await driver.setExtensionStorage(settings)

			await driver.get('http://earth.test:8080')
			await driver.sleep(200) // allow background script to do its work

			const logo = await driver.findElement(By.css('#logo'))
			let display_status = await logo.isDisplayed()
			assert.equal(display_status, false)

			const related = await driver.findElement(By.css('#related'))
			display_status = await related.isDisplayed()
			assert.equal(display_status, true)

			const stats = await driver.findElement(By.css('#stats'))
			display_status = await related.isDisplayed()
			assert.equal(display_status, true)
		})


		it('handles setting changes via the popup', async () => {

			await driver.get('http://earth.test:8080')

			// switch to popup
			const popup_url = await driver.get_popup_url();
			await driver.open_in_new_tab(popup_url)
			await driver.mock_url('http://earth.test:8080')

			// deactive 'related' category
			const related_label = driver.wait(until.elementLocated(By.css('label[for="toggle-cat-related"]')))
			await related_label.click();

			// switch back to page
			const handles = await driver.getAllWindowHandles();
			await driver.switchTo().window(handles[0])

			// should be shown again
			const related = await driver.findElement(By.css('#related'))
			display_status = await related.isDisplayed()
			assert.equal(display_status, true)
		})

	})

})
