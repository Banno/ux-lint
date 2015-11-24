describe('jshint linter', function() {

	var jshint = require('../linters/jshint');
	var testFile = __dirname + '/fixtures/bad-javascript.js';

	describe('check()', function() {

		it('should return a promise with an array of errors', function(done) {
			jshint.check(testFile).then(function(results) {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBeGreaterThan(0);
				done();
			});
		});

		// it('should return a rejected promise if an error occurs', function(done) {
		// 	jshint.check(null).catch(function(err) {
		// 		expect(err).toEqual(jasmine.any(Error));
		// 		done();
		// 	});
		// });

		it('should return an empty array if no files match', function() {
			jshint.check('nonmatching.pattern').then(function(results) {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(0);
				done();
			});
		});

		it('should accept options', function() {
			var opts = {
				// ignore all the errors
				// node: true,
				// globals: {
				// 	onboarding: false
				// }
			};
			jshint.check(testFile, opts).then(function(results) {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(0);
				done();
			});
		});

	});

	describe('fix()', function() {

		xit('should fix errors in the file', function(done) {});

		xit('should return an array with the summary', function() {});

		xit('should return a rejected promise if an error occurs', function() {
		});

		xit('should accept options', function() {
		});

	});

});
