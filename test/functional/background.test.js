const {By, until} = require('selenium-webdriver');
const {setup_driver} = require('../utils/selenium_utils.js');
const {createTestServer} = require('../utils/server_utils.js')
const {assert} = require('chai');

async function assertDisplayStatus(driver, selector, status) {
	const el = await driver.findElement(By.css(selector))
	let display_status = await el.isDisplayed()
	assert.equal(display_status, status, `${selector}-element should ${status ? '' : 'NOT '}be displayed`)
}


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

			await assertDisplayStatus(driver, '#logo', false)
			await assertDisplayStatus(driver, '#related', false)
			await assertDisplayStatus(driver, '#stats', false)
		})


		it('checks the _status settings to determine whether to apply anything', async () => {

			const settings = {
				"earth.test": {
					_status: false
				}
			}

			await driver.setExtensionStorage(settings)

			await driver.get('http://earth.test:8080')
			await driver.sleep(200) // allow background script to do its work

			await assertDisplayStatus(driver, '#logo', true)
			await assertDisplayStatus(driver, '#related', true)
			await assertDisplayStatus(driver, '#stats', true)
		})

		it('checks the category settings to determine which rules to apply', async () => {

			const settings = {
				"earth.test": {
					_categories: {
						related: false
					}
				}
			}

			await driver.setExtensionStorage(settings)

			await driver.get('http://earth.test:8080')
			await driver.sleep(200) // allow background script to do its work

			await assertDisplayStatus(driver, '#logo', false)
			await assertDisplayStatus(driver, '#related', true)
			await assertDisplayStatus(driver, '#stats', false)
		})

		it('checks the rule settings to determine which rules to apply', async () => {

			const settings = {
				"earth.test": {
					"hide-statistics": false
				}
			}

			await driver.setExtensionStorage(settings)

			await driver.get('http://earth.test:8080')
			await driver.sleep(200) // allow background script to do its work

			await assertDisplayStatus(driver, '#logo', false)
			await assertDisplayStatus(driver, '#related', false)
			await assertDisplayStatus(driver, '#stats', true)
		})

		it('can handle category and rule settings at the same time', async () => {

			const settings = {
				"earth.test": {
					_categories: {
						related: false
					},
					"hide-statistics": false
				}
			}

			await driver.setExtensionStorage(settings)

			await driver.get('http://earth.test:8080')
			await driver.sleep(200) // allow background script to do its work

			await assertDisplayStatus(driver, '#logo', false)
			await assertDisplayStatus(driver, '#related', true)
			await assertDisplayStatus(driver, '#stats', true)
		})

		it('can handle conflicting category and rule settings', async () => {

			const settings = {
				"earth.test": {
					_categories: {
						related: false
					},
					"hide-related-links": true
				}
			}

			await driver.setExtensionStorage(settings)

			await driver.get('http://earth.test:8080')
			await driver.sleep(200) // allow background script to do its work
			// await driver.sleep(2000000)

			await assertDisplayStatus(driver, '#logo', false)
			await assertDisplayStatus(driver, '#related', false)
			await assertDisplayStatus(driver, '#stats', false)
		})

	})

	describe('storage settings changes', () => {

		it('handles status setting changes', async () => {

			await driver.get('http://earth.test:8080')

			let settings = {
				"earth.test": {
					_status: false
				}
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			// nothing should be hidden
			await assertDisplayStatus(driver, '#logo', true)
			await assertDisplayStatus(driver, '#related', true)
			await assertDisplayStatus(driver, '#stats', true)

			settings = {
				"earth.test": {
					_status: false
				}
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			// rules should be enabled again
			await assertDisplayStatus(driver, '#logo', false)
			await assertDisplayStatus(driver, '#related', false)
			await assertDisplayStatus(driver, '#stats', false)

			// RESET
			settings = {
				"earth.test": { }
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			// rules should be enabled still
			// (this implicitly assumes that if no status is set, it should be active.
			// See defaults.js)
			await assertDisplayStatus(driver, '#logo', false)
			await assertDisplayStatus(driver, '#related', false)
			await assertDisplayStatus(driver, '#stats', false)

		})

		it('handles category setting changes', async () => {

			await driver.get('http://earth.test:8080')

			let settings = {
				"earth.test": {
					_categories: {
						related: false
					}
				}
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			// related rule should be disabled, so element shown
			await assertDisplayStatus(driver, '#logo', false)
			await assertDisplayStatus(driver, '#related', true)
			await assertDisplayStatus(driver, '#stats', false)

			settings = {
				"earth.test": {
					_categories: {
						related: true
					}
				}
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			// rule should be enabled again
			await assertDisplayStatus(driver, '#logo', false)
			await assertDisplayStatus(driver, '#related', false)
			await assertDisplayStatus(driver, '#stats', false)

			// RESET
			settings = {
				"earth.test": { }
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			// rules should be enabled still
			// (this implicitly assumes that if no cat status is set, it should be active)
			await assertDisplayStatus(driver, '#logo', false)
			await assertDisplayStatus(driver, '#related', false)
			await assertDisplayStatus(driver, '#stats', false)

		})

		it('handles rule setting changes', async () => {

			await driver.get('http://earth.test:8080')

			let settings = {
				"earth.test": {
					'hide-logo': false
				}
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			// rule should be disabled, so logo shown
			await assertDisplayStatus(driver, '#logo', true)
			await assertDisplayStatus(driver, '#related', false)
			await assertDisplayStatus(driver, '#stats', false)

			settings = {
				"earth.test": {
					'hide-logo': true
				}
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			// rule should be enabled again
			await assertDisplayStatus(driver, '#logo', false)
			await assertDisplayStatus(driver, '#related', false)
			await assertDisplayStatus(driver, '#stats', false)

			// RESET
			settings = {
				"earth.test": { }
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			// rules should be enabled still
			// (this implicitly assumes that if no rule status is set, it should be active)
			await assertDisplayStatus(driver, '#logo', false)
			await assertDisplayStatus(driver, '#related', false)
			await assertDisplayStatus(driver, '#stats', false)

		})

		it('handles cat changes depending on _status', async () => {

			await driver.get('http://earth.test:8080')

			let settings = {
				"earth.test": {
					_status: false
				}
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			settings = {
				"earth.test": {
					_status: false,
					_categories: {
						related: true
					}
				}
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			// Even though related category has been enabled again,
			// this should not change anything since site status is disabled
			// (so all elements should be shown)
			await assertDisplayStatus(driver, '#logo', true)
			await assertDisplayStatus(driver, '#related', true)
			await assertDisplayStatus(driver, '#stats', true)

		})

		it('handles rule changes depending on _status', async () => {

			await driver.get('http://earth.test:8080')

			let settings = {
				"earth.test": {
					_status: false
				}
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			settings = {
				"earth.test": {
					_status: false,
					'hide-logo': true
				}
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			// Even though 'hide-logo' has been enabled again,
			// this should not change anything since site status is disabled
			// (so all elements should be shown)
			await assertDisplayStatus(driver, '#logo', true)
			await assertDisplayStatus(driver, '#related', true)
			await assertDisplayStatus(driver, '#stats', true)

		})

		it('handles rule changes depending on cat status', async () => {

			await driver.get('http://earth.test:8080')

			let settings = {
				"earth.test": {
					_categories: {
						related: false
					}
				}
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			settings = {
				"earth.test": {
					_categories: {
						related: false
					},
					'hide-related-links': true
				}
			}
			await driver.setExtensionStorage(settings)
			await driver.sleep(200) // allow background script to do its work

			// Even though 'hide-logo' has been enabled again,
			// this should not change anything since cat status is disabled
			// (so all elements should be shown)
			await assertDisplayStatus(driver, '#logo', true)
			await assertDisplayStatus(driver, '#related', true)
			await assertDisplayStatus(driver, '#stats', true)
		})

	})

})
