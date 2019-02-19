const should = require('chai').should(),
      assert = require('chai').assert,
      expect = require('chai').expect;
const {Builder, By, Key, until} = require('selenium-webdriver');
const {firefox_options, chrome_options, open_popup_page} = require('./utils.js')

describe('Stoic', function() {

	this.timeout(10000);

	var driver;

	before(async function() {
		driver = await new Builder()
			.setFirefoxOptions(firefox_options)
			.setChromeOptions(chrome_options)
			.build();	
	})

	after(async function() {
		await driver.quit()
	})

	describe('popup', function() {

		it('should say "Hello World!', async function() {

			await open_popup_page(driver);

			let header = await driver.findElement(By.css('h1'));
			let text = await header.getText();

			expect(text).to.equal('Hello World')

		})

	})

})
