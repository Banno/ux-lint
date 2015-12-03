var fs       = require('fs-extra');
var tempfile = require('tempfile');

describe('JS API', function() {

	var linter = require('../');
	var badFile  = __dirname + '/fixtures/bad-javascript.js';

	describe('check()', function() {

		it('should set the error object to null when successful', function(done) {
			linter.check(badFile, function(err, results) {
				expect(err).toBe(null);
				done();
			});
		});

		it('should return arrays that are indexed by the linter name', function(done) {
			linter.check(badFile, function(err, results) {
				expect(results).toEqual(jasmine.any(Object));
				expect(results.jshint).toEqual(jasmine.any(Array));
				done();
			});
		});

		it('should accept options as an optional argument', function(done) {
			linter.check(badFile, {}, function(err, results) {
				expect(results).toEqual(jasmine.any(Object));
				expect(results.jshint).toEqual(jasmine.any(Array));
				done();
			});
		});

		it('should return empty results if given a file pattern that doesn\'t match anything', function(done) {
			linter.check(null, function(err, results) {
				expect(err).toBe(null);
				for (var key in results) {
					if (results.hasOwnProperty(key)) {
						expect(results[key]).toEqual([]);
					}
				}
				done();
			});
		});

	});

	describe('fix()', function() {

		var tempFilename;

		beforeEach(function() {
			tempFilename = tempfile('.js');
			fs.copySync(badFile, tempFilename);
		});

		afterEach(function() {
			var contents = fs.readFileSync(tempFilename, { encoding: 'utf8' });
			fs.removeSync(tempFilename);
		});

		it('should set the error object to null when successful', function(done) {
			linter.fix(tempFilename, function(err, results) {
				expect(err).toBe(null);
				done();
			});
		});

		it('should return arrays that are indexed by the linter name', function(done) {
			linter.fix(tempFilename, function(err, results) {
				expect(results).toEqual(jasmine.any(Object));
				expect(results.jshint).toEqual(jasmine.any(Array));
				done();
			});
		});

		it('should accept options as an optional argument', function(done) {
			linter.fix(tempFilename, {}, function(err, results) {
				expect(results).toEqual(jasmine.any(Object));
				expect(results.jshint).toEqual(jasmine.any(Array));
				done();
			});
		});

		it('should return empty results if given a file pattern that doesn\'t match anything', function(done) {
			linter.check(null, function(err, results) {
				expect(err).toBe(null);
				for (var key in results) {
					if (results.hasOwnProperty(key)) {
						expect(results[key]).toEqual([]);
					}
				}
				done();
			});
		});

	});

});
