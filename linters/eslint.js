'use strict';

var extend    = require('extend');
var CLIEngine = require('eslint').CLIEngine;
var flatten   = require('../helper').flatten;
var parseJson = require('../helper').parseJson;
var toArray   = require('../helper').toArray;

var config = parseJson(__dirname + '/../config/eslint.hjson');

exports.check = function(filePattern, opts) {
	return linter('lint', filePattern, opts);
};

// Note that eslint's fix excludes the fixed items from the results.
exports.fix = function(filePattern, opts) {
	return linter('fix', filePattern, opts);
};

// Takes an eslint result from executeOnFiles().
// Returns the error messages, and includes the
//   file path and code from the "result" object.
function extractMessages(result) {
	return result.messages.map(function(message) {
		return extend({}, message, {
			filePath: result.filePath,
			output: result.output
		});
	});
}

function linter(type, filePattern, opts) {
	filePattern = toArray(filePattern);
	opts = extend(true, {}, config, opts);
	var cli = new CLIEngine({
		baseConfig: opts,
		dotfiles: true,
		fix: type === 'fix',
		useEslintrc: false
	});
	var report = cli.executeOnFiles(filePattern);
	var results = flatten(report.results.map(extractMessages)).map(function(result) {
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
	return Promise.resolve(results);
}
