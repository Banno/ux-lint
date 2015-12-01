var extend    = require('extend');
var flatten   = require('../helper').flatten;
var Jscs      = require('jscs');
var parseJson = require('../helper').parseJson;
var readFiles = require('../helper').readFiles;

var config = parseJson(__dirname + '/../config/jscs.hjson');

exports.check = function(filePattern, opts) {
	return linter('checkFile', filePattern, opts);
};

exports.fix = function(filePattern, opts) {
	return linter('fixFile', filePattern, opts);
};

function linter(type, filePattern, opts) {
	var jscs = new Jscs();
	jscs.registerDefaultRules();
	opts = extend(true, {}, config, opts);
	jscs.configure(opts);
	return readFiles(filePattern).then(function(files) {
		return Promise.all(
			files.map(function(fileInfo) {
				return jscs[type](fileInfo.file).then(function(results) {
					return results._errorList.map(function(result) {
						result.character = result.column;
						result.code = result.rule;
						result.description = result.message;
						result.evidence = results._file._lines[result.line];
						result.file = result.filename;
						result.type = 'error';
						return result;
					});
				});
			})
		);
	}).then(function(results) {
		return flatten(results);
	});
}
