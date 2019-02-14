// inspiration from https://stackoverflow.com/a/44249538

var package = require('../package.json');

module.exports = function(source) {

	console.log("CUSTOM LOADER CALLED")

	// see https://webpack.js.org/contribute/writing-a-loader/#loader-dependencies
	this.addDependency('../package.json');

	var manifest = JSON.parse(source);

	manifest.name = package.name;
	manifest.version = package.version;

	manifest_JSON = JSON.stringify(manifest)

	// In Webpack, loaders ultimately produce JavaScript. In order to produce
	// another file type (like JSON), it needs to be emitted separately.
	// this.emitFile('manifest.json', manifest_JSON);
	// Return the processed JSON to be used by the next item in the loader chain.
	return manifest_JSON;

}
