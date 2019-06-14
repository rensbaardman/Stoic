// Webpack configuration for building the extension

const path = require('path');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// following should be temporary - fixed in Webpack 5 (?):
// bundling of css (and css extract plugin) emits extra empty .js file
var SuppressChunksPlugin = require('suppress-chunks-webpack-plugin').default;

const package = require('./package.json');
const version = package.version; // TODO: not necessarily path-friendly
const name = package.name; // TODO: not necessarily path-friendly


function absolute(relative_path) {
	return path.resolve(__dirname, relative_path)
}

function build_manifest(buffer, target) {

	var manifest = JSON.parse(buffer.toString());

	manifest.name = name;
	manifest.version = version;

	// TODO: this is wrong ('applications' instead of
	// 'browser_specific_settings'), and unnecessary since we don't
	// need an ID. But Selenium geckodriver insists.
	if (target === 'firefox') {
		manifest.applications = {
			"gecko": {
				"id": "Stoic@rensbaardman.nl"
			}
		}
	}

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

	let ext;
	if (target === 'firefox') {
		ext = 'xpi'
	}
	else if (target === 'chrome') {
		ext = 'crx'
	}

	let build_name = `${name}-${version}-${target}`;
	let build_dir = absolute(`build/${build_name}`);




	var config = {

		mode: 'production',
	
		entry: {
			"background": "./src/background.js",
			"popup/popup": "./src/popup/popup.js",
			"popup/styles/popup": "./src/popup/styles/popup.sass"
		},

		output: {
			path: build_dir,
			filename: "[name].js"
		},

		optimization: {
			minimize: false
		},

		plugins: [

			new CleanWebpackPlugin(),

			new CopyWebpackPlugin([
			{
				from: "./src/manifest.json",
				to: `${build_dir}/manifest.json`,
				transform (content, path) {
					return build_manifest(content, target)
				}
			},
			{
				from: './src/popup/popup.html',
				to: `${build_dir}/popup`,
				toType: 'dir'
			},
			{
				from: "./assets",
				to: `${build_dir}/assets`,
				toType: 'dir'
			}]),

			new ZipPlugin({
				path: "../",
				filename: build_name,
				extension: ext
			}),

			new MiniCssExtractPlugin({
				filename: '[name].css'
			}),

			// suppress extra .js file created for style.sass/css
			new SuppressChunksPlugin([{name: 'popup/styles/popup', match: /\.js$/ }])
		],

		module: {
			rules: [{
				test: /\.sass$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader'
				]
			}]
		},

		stats: {
			env: true
		}

	};

	// Adds the webextensions-polyfill
	// for chrome only. (and only in
	// the popup, since elsewhere 'browser' is undefined)
	if (target === 'chrome') {
		config.module.rules.push({
			test: /popup\.js$/,
			loader: path.resolve('tools/polyfill_loader.js')
		})
	}

	// if we are doing functional tests,
	// we need to be able to access the bundle,
	// so we can then active tab listeners if
	// we mock a changed url
	if (process.env.WEBPACK_CONTEXT === 'test') {
		config.output.library = 'bundle'
	}

	return config

}
