'use strict';

var fs       = require('fs-extra');
var tempfile = require('tempfile');

describe('jscs linter', function() {

	var jscs = require('../linters/jscs');
	var customMatchers = require('./helpers/custom-matchers');

	var badFile  = __dirname + '/fixtures/bad-javascript.js';
	var goodFile = __dirname + '/fixtures/good-javascript.js';

	beforeEach(function() {
		jasmine.addMatchers(customMatchers);
	});

	describe('check()', function() {

		it('should return a promise with an array of errors', function(done) {
			jscs.check(badFile).then(function(results) {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBeGreaterThan(0);
				done();
			}).catch(function(err) {
				console.log('Error:', err.message);
			});
		});

		it('should have the expected error signature', function(done) {
			jscs.check(badFile).then(function(results) {
				expect(results[1]).toBeLintError();
				done();
			}).catch(function(err) {
				console.log('Error:', err.message);
			});
		});

		it('should return a promise with an empty array for lint-free files', function(done) {
			jscs.check(goodFile).then(function(results) {
				expect(results).toEqual([]);
				done();
			}).catch(function(err) {
				console.log('Error:', err.message);
			});
		});

		it('should accept options', function(done) {
			var opts = {
				// ignore all the errors
				requireSpacesInsideObjectBrackets: false
			};
			jscs.check(badFile, opts).then(function(results) {
				expect(results).toEqual([]);
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

		it('should return a promise with an array', function(done) {
			jscs.fix(tempFilename).then(function(results) {
				expect(results).toEqual(jasmine.any(Array));
				done();
			}).catch(function(err) {
				console.log('Error:', err.message);
			});
		});

	});

});
