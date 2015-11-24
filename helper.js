var fs    = require('fs');
var glob  = require('glob');
var hjson = require('hjson');

// Flattens an array of arrays.
exports.flatten = function (arrayOfArrays) {
	return arrayOfArrays.reduce(function(a, b) {
		return a.concat(b);
	}, []);
};

// Parses an (H)JSON file.
exports.parseJson = function(filename) {
	return hjson.parse(fs.readFileSync(filename, 'utf8'));
};

// Reads in the contents of files matching a pattern.
// Returns a promise with an array of { file: ..., contents: ... } objects.
exports.readFiles = function(filePattern) {
	// Find all matching files.
	var files;
	try {
		files = glob.sync(filePattern);
	} catch (err) {
		return Promise.reject(err);
	}

	if (files.length === 0) {
		return Promise.resolve([]);
	}

	return Promise.all(
		files.map(function(file) {
			return new Promise(function(resolve, reject) {
				fs.readFile(file, 'utf8', function(err, contents) {
					if (err) {
						reject('could not read file ' + file + ': ' + err.message);
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
