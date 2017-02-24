'use strict';

const extend    = require('extend');
const CLIEngine = require('eslint').CLIEngine;
const flatten   = require('../helper').flatten;
const parseJson = require('../helper').parseJson;
const readFiles = require('../helper').readFiles;
const toArray   = require('../helper').toArray;

const config = parseJson(__dirname + '/../config/eslint.hjson');

exports.check = (filePattern, opts) => {
	return linter('lint', filePattern, opts);
};

// Note that eslint's fix excludes the fixed items from the results.
exports.fix = (filePattern, opts) => {
	return linter('fix', filePattern, opts);
};

// Takes an eslint result from executeOnFiles().
// Returns the error messages, and includes the
//   file path and code from the "result" object.
function extractMessages(result) {
	return result.messages.map((message) => {
		return extend({}, message, {
			filePath: result.filePath,
			output: result.output
		});
	});
}

// Returns true if a file is a Javascript file
//   (i.e., has a .js file extension).
function isJsFile(fileInfo) {
	return /\.js$/.test(fileInfo.file);
}

function linter(type, filePattern, opts) {
	filePattern = toArray(filePattern);
	opts = extend(true, {}, config, opts);
	let cli = new CLIEngine({
		baseConfig: opts,
		dotfiles: true,
		fix: type === 'fix',
		useEslintrc: false
	});
	return readFiles(filePattern).then(fileInfo => {
		let files = fileInfo.filter(isJsFile).map(items => items.file);
		let report = cli.executeOnFiles(files);
		let results = flatten(report.results.map(extractMessages)).map((result) => {
			return {
				character: result.column,
				code: result.ruleId,
				description: result.message,
				evidence: result.output,
				file: result.filePath,
				line: result.line,
				plugin: 'eslint',
				type: result.severity > 1 || result.fatal ? 'error' : 'warning'
			};
		});
		if (type === 'fix') {
			CLIEngine.outputFixes(report);
		}
		return results;
	});
}
