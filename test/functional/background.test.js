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

	describe('mic check 1, 2, 3', () => {

		it('jamming', async () => {
			await driver.get('http://earth.test:8080')
			await driver.sleep(5000)
		})

	})

})