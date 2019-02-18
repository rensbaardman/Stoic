let fs = require('fs');

var should = require('chai').should();
var assert = require('chai').assert;

const {Builder, By, Key, until} = require('selenium-webdriver');
let firefox = require('selenium-webdriver/firefox');
let chrome = require('selenium-webdriver/chrome');

let package = require('../../package.json');


function file_to_buffer(file) {
	var file = fs.readFileSync(file);
	return Buffer.from(file).toString('base64');
}

firefox_options = new firefox.Options();
// TODO find a way to load unsigned extensions as temporary extensions in default Firefox
// see https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox
// cf what web-ext does
// cf this issue (undocumented commands?)
// https://github.com/mozilla/geckodriver/issues/473
firefox_options
	.addExtensions('build/Stoic-0.0.0-firefox.xpi')
	.setBinary(firefox.Channel.AURORA)
	.setPreference('xpinstall.signatures.required', false)

chrome_options = new chrome.Options();
chrome_options
	.addExtensions(file_to_buffer('build/Stoic-0.0.0-chrome.crx'))


async function test() {
	driver = await new Builder()
		.setFirefoxOptions(firefox_options)
		.setChromeOptions(chrome_options)
		.build();
}

function open_popup_page(driver) {

}

test()

// TODO: find the best way to test the plugin - no access to the extension itself! ...
// either use a visual framework (very involved), or do partial checking with direct urls, e.g.
// moz-extension://b6c71c21-ba10-1d40-b0b6-15a9a83ffd31/popup/popup.html
// or see what is possible with more advanced webdriver functionality
// there seem to be behind-the-screens possibilities
// see e.g 
// other issue:
// https://github.com/seleniumhq/selenium-google-code-issue-archive/issues/7805
// comparable method
// https://www.blazemeter.com/blog/6-easy-steps-testing-your-chrome-extension-selenium

// describe('tautology', function() {

// 	it('should be true', function() {
// 		assert.isTrue(true);
// 	})

// })


// describe('Google.com', function() {

// 	this.timeout(10000);

// 	var driver;

// 	before(async function() {
// 		driver = await new Builder()
// 			.forBrowser('firefox')
// 			.setFirefoxOptions(firefox_options)
// 			.setChromeOptions(chrome_options)
// 			.build();		
// 	})

// 	// after(async function() {
// 	// 	await driver.quit()
// 	// })

// 	describe('searchpage', function() {

// 		it('should look up searchwords', async function() {

// 			await driver.get('http://www.google.com');

// 			const inputbox = await driver.findElement(By.name('q'))

// 			await inputbox.sendKeys('an example search');
// 			await inputbox.sendKeys(Key.RETURN);


// 			await driver.wait(until.titleIs('an example search - Google zoeken'), 1000)

// 		});

// 		it('should look up test searchwords', async function() {

// 			await driver.get('http://www.google.com');

// 			const inputbox = await driver.findElement(By.name('q'))

// 			await inputbox.sendKeys('test');
// 			await inputbox.sendKeys(Key.RETURN);

// 			await driver.wait(until.titleIs('test - Google zoeken'), 1000)


// 		});

// 	});

// });

