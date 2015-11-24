var extend    = require('extend');
var flatten   = require('../helper').flatten;
var jshint    = require('jshint').JSHINT;
var parseJson = require('../helper').parseJson;
var readFiles = require('../helper').readFiles;

var config = parseJson(__dirname + '/../config/jshint.hjson');

exports.check = function(filePattern, opts) {
	return linter(filePattern, opts);
};

exports.fix = function(filePattern, opts) {
	return linter(filePattern, opts);
};

function linter(filePattern, opts) {
	opts = extend(true, {}, config, opts);
	var output = [];
	return readFiles(filePattern).then(function(files) {
		return files.map(function(fileInfo) {
			console.log('starting jshint for', fileInfo.file);
			jshint(fileInfo.contents, opts);
			console.log('finished jshint for', fileInfo.file);
			// TODO check if errors is actually an array
			// console.log('jshint:', jshint.data());
			return jshint.errors.map(function(error) {
				console.log('mapping on', error);
				error.file = file; // THIS LINE HANGS THE TEST
				return error;
			});
		});
	}).then(function(results) {
		return flatten(results);
	});
};
