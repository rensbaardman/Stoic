const {assert} = require('chai');
const {By, until} = require('selenium-webdriver');
const {setup_driver} = require('../utils/selenium_utils.js')

async function assert_in_popup(driver) {
	const current_url = await driver.getCurrentUrl();
	const popup_url = await driver.get_popup_url();
	if (current_url !== popup_url) {
		throw new Error(`expected to be in popup, but we are currently in ${current_url}`)
	}
}

async function assert_popup_status(driver, status) {

	await assert_in_popup(driver);

	let body = await driver.findElement(By.css('body'));
	let classes = await body.getAttribute('class');

	let input = await driver.findElement(By.css('input#toggle-status'));
	let input_status = await input.isSelected()

	let status_span = await driver.wait(until.elementLocated(By.css('#status')));
	let status_message = await status_span.getText();

	if (status === 'active') {
		assert.equal(classes, '')
		assert.equal(input_status, true)
		assert.equal(status_message, 'active')
	} else if (status === 'disabled') {
		assert.equal(classes, 'disabled')
		assert.equal(input_status, false)
		assert.equal(status_message, 'disabled')
	} else {
		throw new Error(`status to assert_popup_status() should be either 'active' or 'disabled', not ${status}`)
	}
}

async function assert_category_status(driver, cat_id, status) {

	await assert_in_popup(driver);

	let category = await driver.findElement(By.css(`li.category#cat-${cat_id}`));
	let classes = await category.getAttribute('class')

	let input = await driver.findElement(By.css(`input#toggle-cat-${cat_id}`));
	let input_status = await input.isSelected()

	if (status === 'active') {
		assert.notInclude(classes, 'disabled')
		assert.equal(input_status, true)
	}
	else if (status === 'disabled') {
		assert.include(classes, 'disabled')
		assert.equal(input_status, false)
	}
	else {
		throw new Error(`status to assert_category_status() should be either 'active' or 'disabled', not ${status}`)
	}
}

describe('popup', function() {

	this.timeout(10000);
	this.slow(2000);

	var driver;

	before(async function() {
		driver = await setup_driver();
	})

	afterEach(async function() {
		await driver.resetExtensionStorage();
		await driver.safe_close_all_windows();
	})

	after(async function() {
		await driver.quit()
	})

	describe('initial appearance', () => {

		it('is active', async () => {
			await driver.open_popup();
			await assert_popup_status(driver, 'active')
		})

		it("has 'Stoic' in the title", async () => {
			await driver.open_popup();

			let title = await driver.wait(until.elementLocated(By.css('h1')));
			let title_text = await title.getText();

			assert.equal(title_text, 'Stoic')
		});

		it("shows the host of the current page", async () => {

			await driver.open_popup();

			async function new_url_shown() {
				// somehow, the url-mocking doesn't always work the first time
				await driver.mock_url('https://www.my.fake_url.co.uk/folder/directory/index.php');
				let element = await driver.findElement(By.css('#url'));

				let content = await element.getText();
				if (content === 'my.fake_url.co.uk') {
					return true
				}
			}
			// should not time out with TimeoutError
			await driver.wait(new_url_shown, 3000, "expected url to be 'my.fake_url.co.uk'")

		});

		it("shows the categories of the current page", async () => {

			await driver.open_popup();
			await driver.mock_url('https://www.earth.test/yes/no.html');

			// fix to force wait for category elements to load
			await driver.wait(until.elementLocated(By.css('li.category :first-child')));

			let category_titles = await driver.findElements(By.css('li.category h3'))
			let category_texts = await Promise.all(category_titles.map((el) => el.getText()))
			const expected_categories = ['NO RELATED', 'NO LOGO', 'NO STATS']
			assert.deepEqual(category_texts.sort(), expected_categories.sort())

		})

		it("attaches proper 'for' to the categories' labels", async () => {

			await driver.open_popup();
			await driver.mock_url('https://www.earth.test/');

			// fix to force wait for category elements to load
			await driver.wait(until.elementLocated(By.css('li.category :first-child')));

			// should not raise NoSuchElementError
			let related_toggle = await driver.findElement(By.css('label[for="toggle-cat-related"]'))

		})

		it("clicking on a category opens it", async function() {

			await driver.open_popup();
			await driver.mock_url('https://www.earth.test/');

			// fix to force wait for category elements to load
			await driver.wait(until.elementLocated(By.css('li.category :first-child')));

			const related_cat = await driver.findElement(By.css('#cat-related'))
			await related_cat.click()

			const classes = await related_cat.getAttribute('class')

			assert.include(classes, 'opened')

		})

		it('has only one <head></head> element', async () => {

			await driver.open_popup();
			await driver.mock_url('https://www.earth.test/');
			const heads = await driver.findElements(By.css('head'))
			const n_heads = heads.length
			assert.equal(n_heads, 1)

		})

		it('checks the settings to determine status', () => {
			assert.fail('TODO')
		})

		it('checks the settings to determine category status', () => {
			assert.fail('TODO')
		})

		it('checks the settings to determine rule status', () => {
			assert.fail('TODO')
		})

	})

	describe('saving site status', () => {

		it('disables the popup when clicking the status-toggle', async () => {

			await driver.open_popup();

			let label = await driver.wait(until.elementLocated(By.css('label[for="toggle-status"]')));
			// toggle to 'disabled'
			await label.click();
			await assert_popup_status(driver, 'disabled')

		})

		it('enables the popup when clicking the status-toggle again', async () => {

			await driver.open_popup();

			let label = await driver.wait(until.elementLocated(By.css('label[for="toggle-status"]')));
			// toggle to 'disabled'
			await label.click();

			// enable again
			await label.click();
			await assert_popup_status(driver, 'active')

		})

		it('saves the status in storage (to disabled)', async () => {

			await driver.open_popup();
			await driver.mock_url('https://earth.test')

			let label = await driver.findElement(By.css('label[for="toggle-status"]'))
			// toggle to 'disabled'
			await label.click();

			const settings = await driver.getExtensionStorage();

			let expected_settings = {
				'earth.test': {
					_status: false
				}
			}

			assert.deepEqual(settings, expected_settings)

		})

		it('saves the status in storage (to enabled)', async () => {

			await driver.open_popup();
			await driver.mock_url('https://earth.test')

			let label = await driver.findElement(By.css('label[for="toggle-status"]'))
			// toggle to 'disabled'
			await label.click();

			label = await driver.findElement(By.css('label[for="toggle-status"]'))
			// toggle to 'enabled'
			await label.click();

			const settings = await driver.getExtensionStorage();

			const expected_settings = {
				'earth.test': {
					_status: true
				}
			}
			assert.deepEqual(settings, expected_settings)

		})

	})

	describe('saving category status', () => {

		it('changes category status on toggle (disable)', async function() {

			await driver.open_popup();
			await driver.mock_url('https://earth.test');

			let related_toggle = await driver.wait(until.elementLocated(By.css('label[for="toggle-cat-related"]')));
			await related_toggle.click();

			// category 'related' should be disabled
			await assert_category_status(driver, 'related', 'disabled')

		})

		it('changes category status on toggle (enable)', async function() {

			await driver.open_popup();
			await driver.mock_url('https://earth.test');

			let related_toggle = await driver.wait(until.elementLocated(By.css('label[for="toggle-cat-related"]')));
			await related_toggle.click();

			// enable again
			await related_toggle.click();

			// category 'related' should be disabled
			await assert_category_status(driver, 'related', 'active')

		})

		it('saves the category status in storage (disable)', async () => {

			await driver.open_popup();
			await driver.mock_url('https://earth.test')

			let label = await driver.findElement(By.css('label[for="toggle-cat-related"]'))
			// toggle to 'disabled'
			await label.click();

			const settings = await driver.getExtensionStorage();

			let expected_settings = {
				'earth.test': {
					_categories: {
						related: false
					}
				}
			}

			assert.deepEqual(settings, expected_settings)

		})

		it('saves the category status in storage (enable)', async () => {

			await driver.open_popup();
			await driver.mock_url('https://earth.test')

			let label = await driver.findElement(By.css('label[for="toggle-cat-related"]'))
			// toggle to 'disabled'
			await label.click();

			// toggle to 'enabled'
			await label.click();

			const settings = await driver.getExtensionStorage();
			const expected_settings = {
				'earth.test': {
					_categories: {
						related: true
					}
				}
			}
			assert.deepEqual(settings, expected_settings)

		})

	})


	describe('saving rule status', () => {

		it('changes rule status on toggle', async function() {
			assert.fail('TODO')
		})

		it('saves the rule status in storage (disable)', async () => {

			await driver.open_popup();
			await driver.mock_url('https://earth.test')

			// category needs to be open to be able to click on the rule label
			// (else the label is not visible)
			let cat = await driver.findElement(By.css('#cat-related'))
			await cat.click()

			let label = await driver.findElement(By.css('label[for="toggle-rule-hide-related-links"]'))
			// toggle to 'disabled'
			await label.click();

			const settings = await driver.getExtensionStorage();

			const expected_settings = {
				'earth.test': {
					'hide-related-links': false
				}
			}

			assert.deepEqual(settings, expected_settings)

		})

		it('saves the rule status in storage (enable)', async () => {

			await driver.open_popup();
			await driver.mock_url('https://earth.test')

			// category needs to be open to be able to click on the rule label
			// (else the label is not visible)
			let cat = await driver.findElement(By.css('#cat-related'))
			await cat.click()

			let label = await driver.findElement(By.css('label[for="toggle-rule-hide-related-links"]'))
			// toggle to 'disabled'
			await label.click();

			// and ENABLE again
			await label.click();

			const settings = await driver.getExtensionStorage();
			const expected_settings = {
				'earth.test': {
					'hide-related-links': true
				}
			}
			assert.deepEqual(settings, expected_settings)

		})

		it.skip('correctly shows override status [on cat, on rule?] (cat disabled)', async function() {
			assert.fail('TODO')
		})

		it.skip('correctly shows override status [on cat, on rule?] (cat enabled)', async function() {
			assert.fail('TODO')
		})

		it.skip('has the ability to reset a rule to follow the parent category', async function() {
			assert.fail('TODO')
		})

		it.skip('correctly resets the rule to follow the parent category', async function() {
			assert.fail('TODO')
		})

		it.skip('saves the resets to storage', async function() {
			assert.fail('TODO')
		})

		it.skip('correctly disables the override status after rule reset', async function() {
			assert.fail('TODO')
		})

	})


	describe('page loads', () => {

		it("does not repopulate the popup after a refresh", async () => {

			await driver.open_popup();
			await driver.mock_url('https://earth.test')

			// A bit hacky way to check the popup is not reloaded:
			// if it would be reloaded, open categories would be closed.
			related_cat = await driver.wait(until.elementLocated(By.css('#cat-related')))
			// opens the category
			await related_cat.click()

			// refresh
			await driver.mock_url('https://earth.test')
			const classes = await related_cat.getAttribute('class')
			// should still be opened
			assert.include(classes, 'opened')

		})

		it("does not repopulate the popup after url load with same host", async () => {

			await driver.open_popup();
			await driver.mock_url('https://earth.test')

			// A bit hacky way to check the popup is not reloaded:
			// if it would be reloaded, open categories would be closed.
			related_cat = await driver.wait(until.elementLocated(By.css('#cat-related')))
			// opens the category
			await related_cat.click()

			// load url with same host
			await driver.mock_url('https://earth.test/some/child/url.html')
			const classes = await related_cat.getAttribute('class')
			// should still be opened
			assert.include(classes, 'opened')

		})

		it.skip('does not repopulate the popup after url load in different window', () => {
			assert.fail('how to test?')
		})

	})

	describe('errors', () => {

		it.skip("it can handle storage errors", () => {
			assert.fail('what to check for?')
			// i.e. when does browser.storage.local.get() error?
			// when max storage has been reached?
		})

		it.skip('can handle race conditions in saving [category / site / rule] status', () => {
			assert.fail('does this ever happen? How to check for it? (very quickly sending two category changes and hoping they clash?)')
		})
	})


})
