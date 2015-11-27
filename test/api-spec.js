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

		it('should return an error if not given a file pattern', function() {
			linter.check(null, function(err, results) {
				expect(err).toEqual(jasmine.any(Error));
				done();
			});
		});

	});

	describe('fix()', function() {

		it('should set the error object to null when successful', function(done) {
			linter.fix(badFile, function(err, results) {
				expect(err).toBe(null);
				done();
			});
		});

		it('should return arrays that are indexed by the linter name', function(done) {
			linter.fix(badFile, function(err, results) {
				expect(results).toEqual(jasmine.any(Object));
				expect(results.jshint).toEqual(jasmine.any(Array));
				done();
			});
		});

		it('should accept options as an optional argument', function() {
			linter.fix(badFile, {}, function(err, results) {
				expect(results).toEqual(jasmine.any(Object));
				expect(results.jshint).toEqual(jasmine.any(Array));
				done();
			});
		});

		it('should return an error if not given a file pattern', function() {
			linter.check(null, function(err, results) {
				expect(err).toEqual(jasmine.any(Error));
				done();
			});
		});

	});

});
