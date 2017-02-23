/* eslint no-console: "off" */
'use strict';

const fs       = require('fs-extra');
const tempfile = require('tempfile');

describe('JS API', () => {

	const linter = require('../');
	const customMatchers = require('./helpers/custom-matchers');
	const badFile  = __dirname + '/fixtures/bad-javascript.js';

	beforeEach(() => {
		jasmine.addMatchers(customMatchers);
	});

	describe('check()', () => {

		it('should set the error object to null when successful', (done) => {
			linter.check(badFile, (err, results) => {
				expect(err).toBe(null);
				done();
			});
		});

		it('should return an array of linter errors', (done) => {
			linter.check(badFile, (err, results) => {
				if (err) { console.log('Error:', err.message); }
				expect(results).toEqual(jasmine.any(Array));
				expect(results[0]).toBeLintError();
				done();
			});
		});

		it('should accept options as an optional argument', (done) => {
			linter.check(badFile, {}, (err, results) => {
				if (err) { console.log('Error:', err.message); }
				expect(results).toEqual(jasmine.any(Array));
				expect(results[0]).toBeLintError();
				done();
			});
		});

		it('should return empty results if given a file pattern that doesn\'t match anything', (done) => {
			linter.check('supercalifragilisticexpialidocious', (err, results) => {
				expect(err).toBe(null);
				expect(results).toEqual([]);
				done();
			});
		});

	});

	describe('fix()', () => {

		let tempFilename;
		let originalContents, fixedContents;

		beforeEach(() => {
			tempFilename = tempfile('.js');
			fs.copySync(badFile, tempFilename);
			originalContents = fs.readFileSync(tempFilename, { encoding: 'utf8' });
		});

		afterEach(() => {
			fixedContents = fs.readFileSync(tempFilename, { encoding: 'utf8' });
			fs.removeSync(tempFilename);
		});

		it('should set the error object to null when successful', (done) => {
			linter.fix(tempFilename, (err, results) => {
				expect(err).toBe(null);
				done();
			});
		});

		it('should return an array', (done) => {
			linter.fix(tempFilename, (err, results) => {
				if (err) { console.log('Error:', err.message); }
				expect(results).toEqual(jasmine.any(Array));
				done();
			});
		});

		it('should update the file with the fixes', (done) => {
			linter.fix(tempFilename, (err, results) => {
				expect(fixedContents).not.toBe(originalContents);
				done();
			});
		});

		it('should accept options as an optional argument', (done) => {
			linter.fix(tempFilename, {}, (err, results) => {
				if (err) { console.log('Error:', err.message); }
				expect(results).toEqual(jasmine.any(Array));
				done();
			});
		});

		it('should return empty results if given a file pattern that doesn\'t match anything', (done) => {
			linter.check('supercalifragilisticexpialidocious', (err, results) => {
				expect(err).toBe(null);
				expect(results).toEqual([]);
				done();
			});
		});

	});

});
