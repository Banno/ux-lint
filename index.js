'use strict';

const async = require('async');
const { flatten } = require('./helper');
const linters = require('require-all')({
	dirname: __dirname + '/linters'
});

exports.check = (filePattern, opts, callback) => {
	runLinters('check', filePattern, opts, callback);
};

exports.checkCode = (code, opts, callback) => {
	runLinters('checkCode', code, opts, callback);
};

exports.fix = (filePattern, opts, callback) => {
	runLinters('fix', filePattern, opts, callback);
};

exports.fixCode = (code, opts, callback) => {
	runLinters('fixCode', code, opts, callback);
};

// Run all the linters in parallel and collect the results.
// If fixing files, run in series (synchronously) to prevent
//   file write conflicts.
// If fixing code, run in waterfall flow to pass the results
//   from one linter to the next.
function runLinters(type, fileOrCode, opts, callback) {
	if (typeof callback === 'undefined') {
		callback = opts;
	}

	// Save the list of linters.
	let linterNames = Object.keys(linters);

	// Function for normal linting & fixing files.
	let lintByName = (linterName, callback) => {
		let linterOpts = opts[linterName] || {};
		linterOpts.language = opts.language;
		linters[linterName][type](fileOrCode, linterOpts).then(result => {
			callback(null, result);
		}).catch((err) => {
			callback(err);
		});
	};

	// Function for fixing code. It passes the result to the next one in series.
	let createLintingFunc = linterName => {
		return function(source, callback) {
			let linterOpts = opts[linterName] || {};
			linters[linterName][type](source, linterOpts).then(result => {
				callback(null, result);
			}).catch((err) => {
				callback(err);
			});
		};
	};

	// Handles the final results.
	let handleResults = (err, results) => {
		if (err) {
			callback(err);
		} else {
			callback(null, Array.isArray(results) ? flatten(results) : results);
		}
	};

	// Define the method and arguments to pass to the async module.
	let asyncMethod, args;
	if (type === 'fix') {
		asyncMethod = 'mapSeries';
		args = [linterNames, lintByName, handleResults];
	} else if (type === 'fixCode') {
		asyncMethod = 'waterfall';
		let funcs = linterNames.map(createLintingFunc);
		funcs.unshift(callback => { callback(null, fileOrCode); }); // prime the pump with the initial code
		args = [funcs, handleResults];
	} else {
		asyncMethod = 'map';
		args = [linterNames, lintByName, handleResults];
	}

	// Run the linters.
	async[asyncMethod](...args);
}
