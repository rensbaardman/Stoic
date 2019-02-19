const should = require('chai').should(),
      assert = require('chai').assert,
      expect = require('chai').expect;
const {Builder, By, Key, until} = require('selenium-webdriver');
const {firefox_options, chrome_options, get_popup_url, open_in_new_tab, safe_close_window} = require('../selenium_utils.js')


describe('popup', function() {

	this.timeout(20000);

	var driver;
	var popup_url;

	before(async function() {
		driver = await new Builder()
			.setFirefoxOptions(firefox_options)
			.setChromeOptions(chrome_options)
			.build();
		popup_url = await get_popup_url(driver);

	})

	afterEach(async function() {

		// close all windows in a safe manner:
		// leave one 'about:blank'-tab open, so the
		// session stays alive.
		const handles = await driver.getAllWindowHandles();
		for (let handle of handles) {
			await safe_close_window(driver, handle)
		}

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
		await open_in_new_tab(driver, popup_url);

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
