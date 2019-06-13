const should = require('chai').should(),
      assert = require('chai').assert,
      expect = require('chai').expect;
const {By, Key, until} = require('selenium-webdriver');
const {setup_driver} = require('../selenium_utils.js')


describe('popup', function() {

	this.timeout(20000);

	var driver;

	before(async function() {
		driver = await setup_driver();
	})

	afterEach(async function() {
		await driver.safe_close_all_windows()
		// TODO: also do things like:
		// reset local storage
	})

	after(async function() {
		await driver.quit()
	})

	it("should have 'Stoic' in the title", async function() {

		await driver.open_popup();

		let header = await driver.findElement(By.css('h1'));
		let text = await header.getText();

		expect(text).to.equal('Stoic')

	});

	it("should show the url of the active page", async function() {
		
		await driver.open_popup();
		await driver.mock_url('fake_url');

		try {
			var element = await driver.findElement(By.css('#url'));
		}
		catch (error) {
			assert.fail(`Should not have raised ${error}`);
		}

		let content = await element.getText();
		expect(content).to.equal('fake_url')

	})

})
