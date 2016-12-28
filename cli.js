#!/usr/bin/env node
/* eslint no-console: "off" */
'use strict';

const USAGE_STATEMENT = `
${process.argv[1]} [options] [file.js] [dir]

Options:
  --extend [path]         Use custom linter configuration file
  --fix                   Automatically fix linting errors
`;

var chalk     = require('chalk');
var extend    = require('extend');
var linter    = require('./');
var parseArgs = require('minimist');
var parseJson = require('./helper').parseJson;
var reporter  = require('./reporters/stylish');

var firstArgIndex = 2;
var args = parseArgs(process.argv.slice(firstArgIndex));

if (args.help) {
  console.log(USAGE_STATEMENT);
  process.exit();
}

var type = args.fix ? 'fix' : 'check';
var files = (!args._ || args._.length === 0) ? ['src/**/*.js', '*.js'] : args._;

var optFiles;
if (typeof args.extend === 'undefined') {
	optFiles = [];
} else if (Array.isArray(args.extend)) {
	optFiles = args.extend;
} else {
	optFiles = new Array(args.extend);
}

var opts = optFiles.reduce(function(prevVal, currentVal) {
	return extend({}, prevVal, parseJson(currentVal));
}, {});

linter[type](files, opts, function(err, results) {
	if (err) {
		console.log(chalk.red('Error: ') + err.message + '\n');
		console.log(err.stack);
		return;
	}
	reporter(results, args);
	process.exitCode = results.length;
});
