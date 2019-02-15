# Stoic
Browser extensions that hides distracting and unneccessary elements to help you regain focus

### Commands
npm run test:unit
unit testing with the Node.js-engine (fast, but doesn't catch quirks in browser implementations)

npm run test:unit-browser
unit testing with Firefox (current and Beta) and Chrome ()

note the different terminology in Release channels
Firefox: Nightly -> Developer Edition (Aurora) -> Beta -> Stable
Chrome: Canary -> Dev -> Beta -> Stable
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

## misc
probably have to recreate some of the functionality of `web-ext`, unfortunately, but then cross-browser.
at least the bundle thingy

## todo
check Greenkeeper or similar
check Travis or other CI
check BrowserStack: https://docs.travis-ci.com/user/browserstack/ or SauceLabs or Lambdatest https://www.lambdatest.com/

reconsider this: https://devhub.io/repos/PixnBits-karma-selenium-webdriver-launcher
how is this supposed to work?

check: currently an alpha version of selenium-webdriver installed

todo one day: how to deal with npm-dependencies (e.g. leftpad-scenario)

for browser profiles: check locale options

check sublime integration with stuff (possibly run npm commands; integrated js linter)