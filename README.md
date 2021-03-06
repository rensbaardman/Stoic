# Stoic
Browser extension that hides distracting and unneccessary elements to help you regain focus

### Commands

	npm run test:unit

unit testing with the Node.js-engine (fast, but doesn't catch quirks in browser implementations)

	npm run test:unit-browser

unit testing with Firefox and Chrome

---

note the different terminology in Release channels

**Firefox:** Nightly -> Developer Edition (Aurora) -> Beta -> Stable

**Chrome:** Canary -> Dev -> Beta -> Stable

we are interested in the upcoming (next 1 or 2 months) release, but as it would be for users, not for developers. That means Beta. E.g. Developer Edition in Firefox allows unsigned extensions. We want to make sure that our extension is properly signed! Thus we would want to catch this bug.

    ---> actually might not be such a problem, see
    "Unsigned extensions can be installed in Developer Edition, Nightly, and ESR versions of Firefox, after toggling the xpinstall.signatures.required preference in about:config."

The Nightly/Canary editions are too premature too test for. They could contain browser bugs, and would generate a lot of downloading/updating.


## Functional testing
Install `geckodriver` and [`chromedriver`](https://github.com/SeleniumHQ/selenium/wiki/ChromeDriver). These connect Selenium to drive Firefox and Chrome respectively.

E.g. on macOS with Homebrew

    brew install geckodriver
    brew cask install chromedriver

(execute `brew tap homebrew/cask` if necessary).

---> actually have `npm` package for this now (which will download the drivers)

Also install any necessary versions of Firefox and Chrome [to do: fill this with the relevant versions!].

For correct installation location for Chrome see https://github.com/SeleniumHQ/selenium/wiki/ChromeDriver#requirements

To do: 
- use multiple versions of geckodriver/chromedriver to drive multiple versions of chrome and firefox

Resources
https://stackoverflow.com/questions/13724778/how-to-run-selenium-webdriver-test-cases-in-chrome?rq=1
https://stackoverflow.com/questions/16561969/how-to-test-multiple-version-of-google-chrome-using-chromedriver

ah this one (by Rob W!)
https://stackoverflow.com/questions/10541225/cross-browser-testing-all-major-browsers-on-one-machine?noredirect=1&lq=1

makes a solid point: since Chrome and Firefox are updated automatically, browser share for outdated versions is very low

# Modify hosts-file
e.g. on Unix-y systems
```
	sudo nano /etc/hosts
```
and add
```
# test urls for Stoic
localhost earth.test moon.test
::1 earth.test moon.test
```


## todo
- check Greenkeeper or similar
- check Travis or other CI
- check BrowserStack: https://docs.travis-ci.com/user/browserstack/ or SauceLabs or Lambdatest https://www.lambdatest.com/
- check: currently an alpha version of selenium-webdriver installed
- todo one day: how to deal with npm-dependencies (e.g. leftpad-scenario)
- check sublime integration with stuff (possibly run npm commands; integrated js linter)
- install linter
- I am still not very happy with the unit testing (even with manual `browser`-fakes). Since there are a lot of things that can go wrong:
    - did I correctly fake the browser-api?
    - did we request the correct permissions? (now there is no direct test for this!)
the only way to proper test this is to do some kind of integration tests within the popup/extension-scope. But then there is still some awkward parallel testing. What if we forget to request the right permissions, and/or forget the integration tests for that? Or the reverse scenario (we drop a requirement, but still test for it).
- make webpack ignore the WARNING with `const popup = require(popup_src_path);`
- performance: checkout https://developer.chrome.com/extensions/background_migration and https://developer.chrome.com/extensions/performance. I still do not get what 'persistent' actually sets? See https://stackoverflow.com/questions/17632919/chrome-extension-execute-background-page-only-once-when-chrome-starts
- check on which pages you can't use an extension
	Note that content scripts are blocked on the following domains:
	https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
	also about:debugging etc: can't use insertCSS I think
- consider using content scripts to inject / remove CSS, and they communicate with background, which checks for storage changes. This might make porting to Manifest v3 (with Serviceworkers) easier.
- consider using ES6 modules in the browser (saves webpack compiling). But would rewire() still work?
- run debug server for `npm run debug` (to serve earth.test etc.)

### refactor
- make a more universal model that is based around the rule as a core concept. Then with e.g. a settings change, simply calculate for all rules what their status is, compare that to the old statuses, and then handle that. That gets e.g. 'applyStatusChange', 'applyCategoryChange' etc. out of the way, since categories and status become secondary citizens. That is a good thing. Also allows e.g. category-less rules. Maybe also rewrite rule files syntax based on this.
