'use strict';

var async   = require('async');
var flatten = require('./helper').flatten;
var toArray = require('./helper').toArray;
var linters = require('require-all')({
	dirname: __dirname + '/linters'
});

exports.check = function(filePattern, opts, callback) {
	runLinters('check', filePattern, opts, callback);
};

exports.fix = function(filePattern, opts, callback) {
	runLinters('fix', filePattern, opts, callback);
};

function runLinters(type, filePattern, opts, callback) {
	filePattern = toArray(filePattern);
	if (typeof callback === 'undefined') {
		callback = opts;
	}
	var keys = Object.keys(linters);
	async.map(keys, function(linterKey, asyncCallback) {
		var linterOpts = opts[linterKey] || {};
		linters[linterKey][type](filePattern, linterOpts).then(function(result) {
			asyncCallback(null, result);
		}).catch(function(err) {
			asyncCallback(err);
		});
	}, function(err, results) {
		if (err) {
			callback(err);
		} else {
			callback(null, flatten(results));
		}
	});
}
