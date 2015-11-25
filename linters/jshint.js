var extend    = require('extend');
var flatten   = require('../helper').flatten;
var jshint    = require('jshint').JSHINT;
var parseJson = require('../helper').parseJson;
var readFiles = require('../helper').readFiles;

var config = parseJson(__dirname + '/../config/jshint.hjson');

exports.check = function(filePattern, opts) {
	opts = extend(true, {}, config, opts);
	var predefs = opts.globals || {};
	return readFiles(filePattern).then(function(files) {
		return files.map(function(fileInfo) {
			jshint(fileInfo.contents, opts, predefs);
			return jshint.errors.map(function(error) {
				error.description = error.reason;
				error.file = fileInfo.file;
				error.type = error.id.replace(/(^\()|(\)$)/g, ''); // remove the enclosing parens
				return error;
			});
		});
	}).then(function(results) {
		return flatten(results);
	});
};

exports.fix = function() {
	// jshint has no fixing functionality
	return Promise.resolve([]);
};
