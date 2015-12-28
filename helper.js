'use strict';

var fs    = require('fs');
var glob  = require('globby');
var hjson = require('hjson');

// Flattens an array of arrays.
exports.flatten = function (arrayOfArrays) {
	return arrayOfArrays.reduce(function(a, b) {
		return a.concat(b);
	}, []);
};

// Parses an (H)JSON file.
exports.parseJson = function(filename, opts) {
	opts = opts || {};
	try {
		return hjson.parse(fs.readFileSync(filename, 'utf8'));
	} catch (err) {
		if (opts.ignoreErrors) {
			return {};
		} else {
			throw err;
		}
	}
};

// Reads in the contents of files matching a pattern.
// Returns a promise with an array of { file: ..., contents: ... } objects.
exports.readFiles = function(filePattern) {
	// Find all matching files.
	var files = glob.sync(filePattern);

	if (files.length === 0) {
		return Promise.resolve([]);
	}

	var isFile = function(file) {
		var stat = fs.statSync(file);
		if (stat.isFile()) { return true; }
		return false;
	};

	return Promise.all(
		files.filter(isFile).map(function(file) {
			return new Promise(function(resolve, reject) {
				fs.readFile(file, 'utf8', function(err, contents) {
					if (err) {
						reject(new Error('could not read file ' + file + ': ' + err.message));
						return;
					}
					resolve({
						file: file,
						contents: contents
					});
				});
			});
		})
	);
};
