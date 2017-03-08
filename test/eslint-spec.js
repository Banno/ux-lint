/* eslint no-console: "off" */
'use strict';

const del      = require('del');
const fs       = require('fs-extra');
const path     = require('path');
const tempfile = require('tempfile');

describe('eslint linter', () => {

	const eslint = require('../linters/eslint');
	const customMatchers = require('./helpers/custom-matchers');

	const badFile  = __dirname + '/fixtures/bad-javascript.js';
	const goodFile = __dirname + '/fixtures/good-javascript.js';
	const htmlFile = __dirname + '/fixtures/good-html.html';

	beforeEach(() => {
		jasmine.addMatchers(customMatchers);
	});

	describe('check()', () => {

		it('should return a promise with an array of errors', (done) => {
			eslint.check(badFile).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBeGreaterThan(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should have the expected error signature', (done) => {
			eslint.check(badFile).then((results) => {
				expect(results[0]).toBeLintError();
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should return a promise with an empty array for lint-free files', (done) => {
			eslint.check(goodFile).then((results) => {
				expect(results).toEqual([]);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should accept options', (done) => {
			const opts = {
				// ignore all the errors
				rules: {
					indent: 'off',
					'no-undef': 'off',
					'object-curly-spacing': 'off'
				}
			};
			eslint.check(badFile, opts).then((results) => {
				expect(results).toEqual([]);
				done();
			});
		});

		it('should include dotfiles', (done) => {
			const tempFolder = './.tmp';
			const tempFile = path.join(tempFolder, goodFile);
			fs.mkdirSync(tempFolder);
			fs.copySync(goodFile, tempFile);
			eslint.check(tempFile).then((results) => {
				expect(results).toEqual([]);
				del.sync(tempFolder);
				done();
			}).catch((err) => {
				del.sync(tempFolder);
				console.log('Error:', err.stack);
			});
		});

		it('should ignore non-JS files', done => {
			eslint.check(htmlFile).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
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

		it('should return a promise with an array', (done) => {
			eslint.fix(tempFilename).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should include problems that cannot be fixed automatically', (done) => {
			eslint.fix(tempFilename).then((results) => {
				expect(results.length).toBeGreaterThan(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should update the file with the fixes', (done) => {
			eslint.fix(tempFilename).then((results) => {
				expect(fixedContents).not.toBe(originalContents);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

	});

});
