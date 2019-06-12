const should = require('chai').should(),
      assert = require('chai').assert,
      expect = require('chai').expect;

const {	By,
		Key,
		until} = require('selenium-webdriver');

const { setup_driver } = require('../selenium_utils.js')


describe('popup', function() {

	this.timeout(20000);

	var driver;
	var popup_url;

	before(async function() {
		driver = await setup_driver();
		popup_url = await driver.get_popup_url();
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

		await driver.get(popup_url);

		let header = await driver.findElement(By.css('h1'));
		let text = await header.getText();

		expect(text).to.equal('Stoic')

	});

	it("should show the url of the active page", async function() {
		
		await driver.get('http://google.com');
		await driver.open_in_new_tab(popup_url);

		try {
			var element = await driver.findElement(By.css('#url'));
		}
		catch (error) {
			assert.fail(`Should not have raised ${error}`);
		}

		let content = await element.getText();
		expect(content).to.include('google.com')

	})

})
