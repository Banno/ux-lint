#!/usr/bin/env node

var chalk     = require('chalk');
var extend    = require('extend');
var linter    = require('./');
var parseArgs = require('minimist');
var parseJson = require('./helper').parseJson;
var reporter  = require('./reporters/stylish');

var args = parseArgs(process.argv.slice(2));

var type = args.fix ? 'fix' : 'check';
var files = (!args._ || args._.length === 0) ? ['src/**', '*.js'] : args._;

var optFiles;
if (typeof args.extend === 'undefined') {
	optFiles = [];
} else if (Array.isArray(args.extend)) {
	optFiles = args.extend;
} else {
	optFiles = Array(args.extend);
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
});
