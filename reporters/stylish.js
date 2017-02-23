//
// Stylish reporter, inspired by jshint-stylish
//   (https://github.com/sindresorhus/jshint-stylish).
//
/* eslint no-console: "off" */
'use strict';
const chalk        = require('chalk');
const logSymbols   = require('log-symbols');
const plur         = require('plur');
const sortFunc     = require('../helper').sort;
const stringLength = require('string-length');
const table        = require('text-table');

module.exports = (results, opts) => {
	let output = '';
	let headers = [];
	let prevfile;
	let errorCount = 0;
	let warningCount = 0;

	opts = opts || {};

	results.sort(sortFunc);

	output += table(results.map((err, i) => {
		let isError = err.type && err.type === 'error';

		let line = [
			'',
			'',
			chalk.gray(err.plugin),
			chalk.gray(err.code),
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
	}).split('\n').map((line, i) => {
		return headers[i] ? '\n  ' + chalk.underline(headers[i]) + '\n' + line : line;
	}).join('\n') + '\n\n';

	if (errorCount + warningCount > 0) {
		if (errorCount > 0) {
			output += logSymbols.error + '  ' + errorCount + ' ' + plur('error', errorCount) + '\n';
		}
		if (warningCount > 0) {
			output += logSymbols.warning + '  ' + warningCount + ' ' + plur('warning', warningCount) + '\n';
		}
	} else {
		output += logSymbols.success + ' No problems\n';
	}

	console.log(output);
};
