'use strict';

const async = require('async');
const { flatten, toArray } = require('./helper');
const linters = require('require-all')({
	dirname: __dirname + '/linters'
});

exports.check = (filePattern, opts, callback) => {
	runLinters('check', filePattern, opts, callback);
};

exports.fix = (filePattern, opts, callback) => {
	runLinters('fix', filePattern, opts, callback);
};

function runLinters(type, filePattern, opts, callback) {
	filePattern = toArray(filePattern);
	if (typeof callback === 'undefined') {
		callback = opts;
	}
	let keys = Object.keys(linters);
	async.map(keys, (linterKey, asyncCallback) => {
		let linterOpts = opts[linterKey] || {};
		linters[linterKey][type](filePattern, linterOpts).then((result) => {
			asyncCallback(null, result);
		}).catch((err) => {
			asyncCallback(err);
		});
	}, (err, results) => {
		if (err) {
			callback(err);
		} else {
			callback(null, flatten(results));
		}
	});
}
