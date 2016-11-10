/* eslint no-console: "off" */
'use strict';

var fs       = require('fs-extra');
var tempfile = require('tempfile');

describe('eslint linter', function() {

	var eslint = require('../linters/eslint');
	var customMatchers = require('./helpers/custom-matchers');

	var badFile  = __dirname + '/fixtures/bad-javascript.js';
	var goodFile = __dirname + '/fixtures/good-javascript.js';

	beforeEach(function() {
		jasmine.addMatchers(customMatchers);
	});

	describe('check()', function() {

		it('should return a promise with an array of errors', function(done) {
			eslint.check(badFile).then(function(results) {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBeGreaterThan(0);
				done();
			}).catch(function(err) {
				console.log('Error:', err.stack);
			});
		});

		it('should have the expected error signature', function(done) {
			eslint.check(badFile).then(function(results) {
				expect(results[0]).toBeLintError();
				done();
			}).catch(function(err) {
				console.log('Error:', err.stack);

			});
		});

		it('should return a promise with an empty array for lint-free files', function(done) {
			eslint.check(goodFile).then(function(results) {
				expect(results).toEqual([]);
				done();
			}).catch(function(err) {
				console.log('Error:', err.stack);
			});
		});

		it('should accept options', function(done) {
			var opts = {
				// ignore all the errors
				rules: {
					indent: 'off',
					'no-undef': 'off',
					'object-curly-spacing': 'off'
				}
			};
			eslint.check(badFile, opts).then(function(results) {
				expect(results).toEqual([]);
				done();
			});
		});

	});

	describe('fix()', function() {

		var tempFilename;
		var originalContents, fixedContents;

		beforeEach(function() {
			tempFilename = tempfile('.js');
			fs.copySync(badFile, tempFilename);
			originalContents = fs.readFileSync(tempFilename, { encoding: 'utf8' });
		});

		afterEach(function() {
			fixedContents = fs.readFileSync(tempFilename, { encoding: 'utf8' });
			fs.removeSync(tempFilename);
		});

		it('should return a promise with an array', function(done) {
			eslint.fix(tempFilename).then(function(results) {
				expect(results).toEqual(jasmine.any(Array));
				done();
			}).catch(function(err) {
				console.log('Error:', err.stack);
			});
		});

		it('should include problems that cannot be fixed automatically', function(done) {
			eslint.fix(tempFilename).then(function(results) {
				expect(results.length).toBeGreaterThan(0);
				done();
			}).catch(function(err) {
				console.log('Error:', err.stack);
			});
		});

		it('should update the file with the fixes', function(done) {
			eslint.fix(tempFilename).then(function(results) {
				expect(fixedContents).not.toBe(originalContents);
				done();
			}).catch(function(err) {
				console.log('Error:', err.stack);
			});
		});

	});

});
