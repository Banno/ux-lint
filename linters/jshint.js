'use strict';

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
			try {
				jshint(fileInfo.contents, opts, predefs);
				return jshint.errors.map(function(error) {
					error.id = error.id || '(error)'; // "Too many errors" does not have an ID
					return {
						character: error.character,
						code: error.code,
						description: error.reason,
						evidence: error.evidence,
						file: fileInfo.file,
						line: error.line,
						plugin: 'jshint',
						type: error.id.replace(/(^\()|(\)$)/g, ''), // remove the enclosing parens
					};
				});
			} catch (err) {
				err.message = err.message + ' (' + fileInfo.file + ')';
				throw err;
			}
		});
	}).then(function(results) {
		return flatten(results);
	});
};

exports.fix = function() {
	// The jshint module has no fixing functionality.
	return Promise.resolve([]);
};
