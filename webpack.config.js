const path = require('path');

var webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
var ZipPlugin = require('zip-webpack-plugin');

function absolute(relative_path) {
	return path.resolve(__dirname, relative_path)
}

let package = require('./package.json');
let version = package.version; // TODO: not necessarily path-friendly
let name = package.name; // TODO: not necessarily path-friendly


function build_manifest(buffer) {

	var manifest = JSON.parse(buffer.toString());

	manifest.name = name;
	manifest.version = version;

	// pretty print with 2 spaces (second argument is transform:
	// does nothing when 'null')
	manifest_JSON = JSON.stringify(manifest, null, 2)

	return manifest_JSON;

}



module.exports = function(environment) {

	let target = environment;
	if (!['firefox', 'chrome'].includes(target)) {
		console.log(`Error: target ${target} is not 'firefox' or 'chrome'`)
		throw `${target} is not 'firefox' or 'chrome'`
	}

	let build_name = `${name}-${version}-${target}`;
	let build_dir = absolute(`build/${build_name}`);




	var config = {

		mode: 'production',
	
		entry: {
			"background": "./src/background.js",
			"popup/popup": "./src/popup/popup.js"
		},

		output: {
			path: build_dir,
			filename: "[name].js"
		},

		optimization: {
			minimize: false
		},

		plugins: [
			new CopyWebpackPlugin([
			{
				from: "./src/manifest.json",
				to: `${build_dir}/manifest.json`,
				transform (content, path) {
					return build_manifest(content)
				}
			},
			{
				from: './src/popup/popup.html',
				to: `${build_dir}/popup`,
				toType: 'dir'			
			}]),

			new CleanWebpackPlugin([build_dir], {
				root: absolute("build")
			}),

			new ZipPlugin({
				path: "../",
				filename: build_name
			})
		]
	};

	if (target === 'firefox') {
		var ignore_polyfill = new webpack.IgnorePlugin({
			resourceRegExp: /^webextension-polyfill$/
		});
		config.plugins.push(ignore_polyfill);
	}

	return config

}
