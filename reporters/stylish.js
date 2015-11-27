//
// Stylish reporter, inspired by jshint-stylish
//   (https://github.com/sindresorhus/jshint-stylish).
//
'use strict';
var chalk        = require('chalk');
var logSymbols   = require('log-symbols');
var plur         = require('plur');
var stringLength = require('string-length');
var table        = require('text-table');

module.exports = function(results, opts) {
	var output = '';
	var headers = [];
	var prevfile;
	var errorCount = 0;
	var warningCount = 0;

	opts = opts || {};

	output += Object.keys(results).reduce(function(prevVal, pluginName) {
		var ret = prevVal;

		ret += '\n' + chalk.bold.white('~~ ' + pluginName + ' ~~') + '\n';

		ret += table(results[pluginName].map(function(err, i) {
			var isError = err.type && err.type === 'error';

			var line = [
				'',
				'',
				chalk.gray('line ' + err.line),
				chalk.gray('col ' + err.character),
				isError ? chalk.red(err.description) : chalk.blue(err.description)
			];

			if (err.file !== prevfile) {
				headers[i] = err.file;
			}

			if (opts.verbose) {
				line.push(chalk.gray('(' + err.code + ')'));
			}

			if (isError) {
				errorCount++;
			} else {
				warningCount++;
			}

			prevfile = err.file;

			return line;
		}), {
			stringLength: stringLength
		}).split('\n').map(function(line, i) {
			return headers[i] ? '\n  ' + chalk.underline(headers[i]) + '\n' + line : line;
		}).join('\n') + '\n\n';

		return ret;
	}, '');

	if (errorCount + warningCount > 0) {
		if (errorCount > 0) {
			output += logSymbols.error + '  ' + errorCount + ' ' + plur('error', errorCount) + '\n';
		}
		if (warningCount > 0) {
			output += logSymbols.warning + '  ' + warningCount + ' ' + plur('warning', warningCount) + '\n';
		}
	} else {
		output += logSymbols.success + ' No problems' + '\n';
	}

	console.log(output.trim() + '\n');
};
