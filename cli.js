#!/usr/bin/env node
/* eslint no-console: "off" */
'use strict';

/* eslint-disable indent */
const USAGE_STATEMENT = `
ux-lint [options] [file.js ...] [dir ...]

Options:
  --extend [path]         Use custom linter configuration file
  --fix                   Automatically fix linting errors
`;
/* eslint-enable indent */

const chalk     = require('chalk');
const extend    = require('extend');
const linter    = require('./');
const parseArgs = require('minimist');
const parseJson = require('./helper').parseJson;
const reporter  = require('./reporters/stylish');

const firstArgIndex = 2;
const args = parseArgs(process.argv.slice(firstArgIndex));

if (args.help) {
	console.log(USAGE_STATEMENT);
	process.exit();
}

let type = args.fix ? 'fix' : 'check';
let files = (!args._ || args._.length === 0) ? ['src/**/*.js', '*.js'] : args._;

let optFiles;
if (typeof args.extend === 'undefined') {
	optFiles = [];
} else if (Array.isArray(args.extend)) {
	optFiles = args.extend;
} else {
	optFiles = new Array(args.extend);
}

let opts = optFiles.reduce((prevVal, currentVal) => {
	return extend({}, prevVal, parseJson(currentVal));
}, {});

linter[type](files, opts, (err, results) => {
	if (err) {
		console.log(chalk.red('Error: ') + err.message + '\n');
		console.log(err.stack);
		return;
	}
	reporter(results, args);
	process.exitCode = results.length;
});
