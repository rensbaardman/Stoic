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

	describe.skip('initial appearance', () => {

		it("should have 'Stoic' in the title", async () => {
			// kind of a smoke test

			await driver.open_popup();

			let header = await driver.findElement(By.css('h1'));
			let text = await header.getText();

			expect(text).to.equal('Stoic')

		});

		it("should show the host of the current page", async () => {

			await driver.open_popup();
			await driver.mock_url('https://www.my.fake_url.co.uk/folder/directory/index.php');

			let element = await driver.findElement(By.css('#url'));

			let content = await element.getText();
			expect(content).to.equal('my.fake_url.co.uk');

		});

		it("should show the categories of the current page", async () => {

			await driver.open_popup();
			await driver.mock_url('https://www.example.com/yes/no.html');

			let category_titles = await driver.findElements(By.css('li.category h3'))
			let category_texts = await Promise.all(category_titles.map((el) => el.getText()))

			const expected_categories = ['NO RELATED', 'NO LOGO']
			assert.deepEqual(category_texts.sort(), expected_categories.sort())

		})

	})

	describe('saving settings', () => {

		it('should disable the popup when clicking the status-toggle', async () => {

			await driver.open_popup();
			let body = driver.findElement(By.css('body'));
			let classes = await body.getAttribute('class');
			// sanity check
			assert.equal(classes, '')

			let label = await driver.findElement(By.css('label[for="toggle-status"]'))
			// toggle to 'disabled'
			await label.click();

			classes = await body.getAttribute('class');
			assert.equal(classes, 'disabled')

		})


		it('should contain the disabled state per site', async () => {

			await driver.open_popup();
			await driver.mock_url('https://example.com')
			let body = await driver.findElement(By.css('body'));

			let label = await driver.findElement(By.css('label[for="toggle-status"]'))
			// toggle to 'disabled'
			await label.click();

			await driver.mock_url('https://some-other-url.com')
			body = await driver.findElement(By.css('body'));
			classes = await body.getAttribute('class');
			// setting example.com to disabled shouldn't have set
			// some-other-url.com to disabled
			assert.equal(classes, '')

		})

		it('should persist the disabled states per site', async () => {

			await driver.open_popup();
			await driver.mock_url('https://example.com')

			let label = await driver.findElement(By.css('label[for="toggle-status"]'))
			// toggle to 'disabled'
			await label.click();

			await driver.mock_url('https://some-other-url.com')
			await driver.mock_url('https://example.com')

			let body = await driver.findElement(By.css('body'));
			let classes = await body.getAttribute('class');
			// should have saved the state after refresh
			assert.equal(classes, 'disabled')

		})


	})

})
