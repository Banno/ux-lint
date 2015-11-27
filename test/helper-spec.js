var fs = require('fs');

describe('helper functions', function() {

	describe('flatten()', function() {

		var flatten = require('../helper').flatten;

		it('should throw an error if argument is not an array', function() {
			expect(function() {
				flatten(null);
			}).toThrow();
		});

		it('should return the array unchanged if there are no nested arrays', function() {
			expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
		});

		it('should flatten an array of arrays', function() {
			expect(flatten([[1, 2], [3, 4], 5])).toEqual([1, 2, 3, 4, 5]);
		});

	});

	describe('parseJson()', function() {

		var parseJson = require('../helper').parseJson;

		it('should parse an HJSON file', function() {
			var parsed = parseJson(__dirname + '/../config/jshint.hjson');
			expect(parsed).toEqual(jasmine.any(Object));
			expect(parsed.globals).toBeDefined();
		});

	});

	describe('readFiles()', function() {

		var readFiles = require('../helper').readFiles;
		var filename, contents;

		beforeEach(function() {
			filename = __dirname + '/fixtures/bad-javascript.js';
			contents = fs.readFileSync(filename, 'utf8');
		});

		it('should return a promise', function() {
			expect(readFiles(filename)).toEqual(jasmine.any(Promise));
		});

		it('should resolve to an array with the file contents object', function(done) {
			readFiles(filename).then(function(results) {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(1);
				expect(results[0].file).toBe(filename);
				expect(results[0].contents).toBe(contents);
				done();
			});
		});

		it('should resolve to an empty array if there are no matching files', function(done) {
			readFiles('nonmatching.pattern').then(function(results) {
				expect(results).toEqual([]);
				done();
			});
		});

		it('should support an array of patterns', function(done) {
			readFiles([
				'test/fixtures/bad-javascript.js',
				'test/fixtures/good-javascript.js'
			]).then(function(results) {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(2);
				done();
			});
		});

		it('should resolve to an empty array if an invalid pattern is used', function(done) {
			readFiles(null).then(function(results) {
				expect(results).toEqual([]);
				done();
			});
		});

	});

});
