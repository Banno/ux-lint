var async = require('async');
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
		linters[linterKey][type](filePattern).then(function(result) {
			asyncCallback(null, result);
		}).catch(function(err) {
			asyncCallback(err);
		});
	}, function(err, results) {
		var key, keyedResults = {};
		for (var i = 0; i < results.length; i++) {
			key = keys[i];
			keyedResults[key] = results[i];
		}
		callback(err, keyedResults);
	});
}
