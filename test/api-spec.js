/* eslint no-console: "off" */
'use strict';

var fs       = require('fs-extra');
var tempfile = require('tempfile');

describe('JS API', function() {

	var linter = require('../');
	var customMatchers = require('./helpers/custom-matchers');
	var badFile  = __dirname + '/fixtures/bad-javascript.js';

	beforeEach(function() {
		jasmine.addMatchers(customMatchers);
	});

	describe('check()', function() {

		it('should set the error object to null when successful', function(done) {
			linter.check(badFile, function(err, results) {
				expect(err).toBe(null);
				done();
			});
		});

		it('should return an array of linter errors', function(done) {
			linter.check(badFile, function(err, results) {
				if (err) { console.log('Error:', err.message); }
				expect(results).toEqual(jasmine.any(Array));
				expect(results[0]).toBeLintError();
				done();
			});
		});

		it('should accept options as an optional argument', function(done) {
			linter.check(badFile, {}, function(err, results) {
				if (err) { console.log('Error:', err.message); }
				expect(results).toEqual(jasmine.any(Array));
				expect(results[0]).toBeLintError();
				done();
			});
		});

		it('should return empty results if given a file pattern that doesn\'t match anything', function(done) {
			linter.check('supercalifragilisticexpialidocious', function(err, results) {
				expect(err).toBe(null);
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

		it('should set the error object to null when successful', function(done) {
			linter.fix(tempFilename, function(err, results) {
				expect(err).toBe(null);
				done();
			});
		});

		it('should return an array', function(done) {
			linter.fix(tempFilename, function(err, results) {
				if (err) { console.log('Error:', err.message); }
				expect(results).toEqual(jasmine.any(Array));
				done();
			});
		});

		it('should update the file with the fixes', function(done) {
			linter.fix(tempFilename, function(err, results) {
				expect(fixedContents).not.toBe(originalContents);
				done();
			});
		});

		it('should accept options as an optional argument', function(done) {
			linter.fix(tempFilename, {}, function(err, results) {
				if (err) { console.log('Error:', err.message); }
				expect(results).toEqual(jasmine.any(Array));
				done();
			});
		});

		it('should return empty results if given a file pattern that doesn\'t match anything', function(done) {
			linter.check('supercalifragilisticexpialidocious', function(err, results) {
				expect(err).toBe(null);
				expect(results).toEqual([]);
				done();
			});
		});

	});

});
