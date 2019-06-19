const {assert} = require('chai');
const {By, until} = require('selenium-webdriver');
const {setup_driver} = require('../selenium_utils.js')


async function assert_popup_status(driver, status) {
	const current_url = await driver.getCurrentUrl();
	const popup_url = await driver.get_popup_url();
	if (current_url !== popup_url) {
		throw new Error(`assert_popup_status() can only be called when in popup, currently in ${current_url}`)
	}

	let body = await driver.findElement(By.css('body'));
	let classes = await body.getAttribute('class');

	let status_span = await driver.wait(until.elementLocated(By.css('#status')));
	let status_message = await status_span.getText();

	if (status === 'active') {
		assert.equal(classes, '')
		assert.equal(status_message, 'active')
	} else if (status === 'disabled') {
		assert.equal(classes, 'disabled')
		assert.equal(status_message, 'disabled')
	} else {
		throw new Error(`status to assert_popup_status() should be either 'active' or 'disabled', not ${status}`)
	}
}

describe('popup', function() {

	this.timeout(20000);

	var driver;

	before(async function() {
		driver = await setup_driver();
	})

	afterEach(async function() {
		await driver.reset_extension_storage();
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
			await driver.mock_url('https://www.my.fake_url.co.uk/folder/directory/index.php');

			let element = await driver.findElement(By.css('#url'));

			let content = await element.getText();
			assert.equal(content, 'my.fake_url.co.uk');

		});

		it("shows the categories of the current page", async () => {

			await driver.open_popup();
			await driver.mock_url('https://www.example.com/yes/no.html');

			// fix to force wait for category elements to load
			await driver.wait(until.elementLocated(By.css('li.category :first-child')));

			let category_titles = await driver.findElements(By.css('li.category h3'))
			let category_texts = await Promise.all(category_titles.map((el) => el.getText()))
			const expected_categories = ['NO RELATED', 'NO LOGO']
			assert.deepEqual(category_texts.sort(), expected_categories.sort())

		})

		it("attaches proper 'for' to the categories' labels", async () => {

			await driver.open_popup();
			await driver.mock_url('https://www.example.com/yes/no.html');

			// fix to force wait for category elements to load
			await driver.wait(until.elementLocated(By.css('li.category :first-child')));

			// should not raise NoSuchElementError
			let related_toggle = await driver.findElement(By.css('label[for="toggle-related"]'))


		})



	})

	describe('saving settings', () => {

		it('disables the popup when clicking the status-toggle', async () => {

			await driver.open_popup();

			let label = await driver.wait(until.elementLocated(By.css('label[for="toggle-status"]')));
			// toggle to 'disabled'
			await label.click();
			await assert_popup_status(driver, 'disabled')

		})

		it('saves the popup states', async () => {

			await driver.open_popup();
			await driver.mock_url('https://example.com')

			let label = await driver.findElement(By.css('label[for="toggle-status"]'))
			// toggle to 'disabled'
			await label.click();

			await driver.mock_url('https://some-other-url.com')
			await driver.mock_url('https://example.com')

			// should have saved the state after refresh
			await assert_popup_status(driver, 'disabled')

		})

		it("doesn't leak the disabled state to other sites", async () => {

			await driver.open_popup();
			await driver.mock_url('https://example.com')

			let label = await driver.findElement(By.css('label[for="toggle-status"]'))
			// toggle to 'disabled'
			await label.click();

			await driver.mock_url('https://some-other-url.com')
			// setting example.com to disabled shouldn't have set
			// some-other-url.com to disabled
			await assert_popup_status(driver, 'active')

		})

			await driver.mock_url('https://example.com')

			// should have saved the state after refresh
			await assert_popup_status(driver, 'disabled')

		})


	})

})
