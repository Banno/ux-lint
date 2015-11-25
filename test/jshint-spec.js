describe('jshint linter', function() {

	var jshint = require('../linters/jshint');
	var customMatchers = require('./helpers/custom-matchers');

	var badFile  = __dirname + '/fixtures/bad-javascript.js';
	var goodFile = __dirname + '/fixtures/good-javascript.js';

	beforeEach(function() {
		jasmine.addMatchers(customMatchers);
	});

	describe('check()', function() {

		it('should return a promise with an array of errors', function(done) {
			jshint.check(badFile).then(function(results) {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBeGreaterThan(0);
				done();
			}).catch(function(err) {
				console.log('Error:', err.message);
			});
		});

		it('should have the expected error signature', function(done) {
			jshint.check(badFile).then(function(results) {
				expect(results[1]).toBeLintError();
				done();
			}).catch(function(err) {
				console.log('Error:', err.message);
			});
		});

		it('should return a promise with an empty array for lint-free files', function(done) {
			jshint.check(goodFile).then(function(results) {
				expect(results).toEqual([]);
				done();
			}).catch(function(err) {
				console.log('Error:', err.message);
			});
		});

		it('should accept options', function(done) {
			var opts = {
				// ignore all the errors
				node: true,
				devel: true,
				globals: {
					onboarding: false
				}
			};
			jshint.check(badFile, opts).then(function(results) {
				expect(results).toEqual([]);
				done();
			});
		});

	});

	describe('fix()', function() {

		it('should return an empty array', function(done) {
			jshint.fix(badFile).then(function(results) {
				expect(results).toEqual([]);
				done();
			}).catch(function(err) {
				console.log('Error:', err.message);
			});
		});

	});

});
