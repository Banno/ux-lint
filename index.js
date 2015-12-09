'use strict';

var async   = require('async');
var flatten = require('./helper').flatten;
var linters = require('load-plugins')('./linters/*.js');

exports.check = function(filePattern, opts, callback) {
	runLinters('check', filePattern, opts, callback);
};

exports.fix = function(filePattern, opts, callback) {
	runLinters('fix', filePattern, opts, callback);
};

function runLinters(type, filePattern, opts, callback) {
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
