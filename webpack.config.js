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
			"popup/popup": "./src/popup/popup.js",
			"manifest": "./src/manifest.json" 
		},

		output: {
			path: build_dir,
			filename: "[name].js"
		},

		module: {
			rules: [{
				test: /manifest.json$/,
				use: [{
					loader: path.resolve('tools/manifest-loader.js')
				}]
			}]
		},

		optimization: {
			minimize: false
		},

		plugins: [
			new CopyWebpackPlugin([
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
