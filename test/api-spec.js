/* eslint no-console: "off" */
'use strict';

const fs       = require('fs-extra');
const tempfile = require('tempfile');

describe('JS API', () => {

	const linter = require('../');
	const customMatchers = require('./helpers/custom-matchers');

	const badFile = __dirname + '/fixtures/bad-javascript.js';
	const badCode = fs.readFileSync(badFile, 'utf8');
	const fixedFile = __dirname + '/fixtures/fixed-javascript.js';
	const fixedCode = fs.readFileSync(fixedFile, 'utf8');

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

	describe('checkCode()', () => {

		it('should set the error object to null when successful', (done) => {
			linter.checkCode(badCode, (err, results) => {
				expect(err).toBe(null);
				done();
			});
		});

		it('should return an array of linter errors', (done) => {
			linter.checkCode(badCode, (err, results) => {
				if (err) { console.log('Error:', err.message); }
				expect(results).toEqual(jasmine.any(Array));
				expect(results[0]).toBeLintError();
				done();
			});
		});

		it('should accept options as an optional argument', (done) => {
			linter.checkCode(badCode, {}, (err, results) => {
				if (err) { console.log('Error:', err.message); }
				expect(results).toEqual(jasmine.any(Array));
				expect(results[0]).toBeLintError();
				done();
			});
		});

	});

	describe('fix()', () => {

		let tempFilename;
		let fixedContents;

		beforeEach(() => {
			tempFilename = tempfile('.js');
			fs.copySync(badFile, tempFilename);
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
				expect(fixedContents).toBe(fixedCode);
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

	describe('fixCode()', () => {

		it('should set the error object to null when successful', (done) => {
			linter.fixCode(badCode, (err, results) => {
				expect(err).toBe(null);
				done();
			});
		});

		it('should return a string', (done) => {
			linter.fixCode(badCode, (err, results) => {
				if (err) { console.log('Error:', err.message); }
				expect(results).toEqual(jasmine.any(String));
				done();
			});
		});

		it('should update the file with the fixes', (done) => {
			linter.fixCode(badCode, (err, results) => {
				expect(results).toBe(fixedCode);
				done();
			});
		});

		it('should accept options as an optional argument', (done) => {
			linter.fixCode(badCode, {}, (err, results) => {
				if (err) { console.log('Error:', err.message); }
				expect(results).toBe(fixedCode);
				done();
			});
		});

	});

});
