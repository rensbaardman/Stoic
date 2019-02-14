var should = require('chai').should();
var assert = require('chai').assert;

const {Builder, By, Key, until} = require('selenium-webdriver');


describe('tautology', function() {

	it('should be true', function() {
		assert.isTrue(true);
	})

})


describe('Google.com', function() {

	this.timeout(10000);

	var driver;

	before(async function() {
		driver = await new Builder()
			.forBrowser('firefox')
			.build();		
	})

	after(async function() {
		await driver.quit()
	})

	describe('searchpage', function() {

		it('should look up searchwords', async function() {

			await driver.get('http://www.google.com');

			const inputbox = await driver.findElement(By.name('q'))

			await inputbox.sendKeys('an example search');
			await inputbox.sendKeys(Key.RETURN);


			await driver.wait(until.titleIs('an example search - Google zoeken'), 1000)

		});

		it('should look up test searchwords', async function() {

			await driver.get('http://www.google.com');

			const inputbox = await driver.findElement(By.name('q'))

			await inputbox.sendKeys('test');
			await inputbox.sendKeys(Key.RETURN);

			await driver.wait(until.titleIs('test - Google zoeken'), 1000)


		});

	});

});

