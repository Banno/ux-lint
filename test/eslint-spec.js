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
	const badCode  = fs.readFileSync(badFile, 'utf8');

	const cssFile = __dirname + '/fixtures/good-css.css';
	const cssCode = fs.readFileSync(cssFile, 'utf8');

	const fixedFile = __dirname + '/fixtures/fixed-javascript.js';
	const fixedCode = fs.readFileSync(fixedFile, 'utf8');

	const goodFile = __dirname + '/fixtures/good-javascript.js';
	const goodCode = fs.readFileSync(goodFile, 'utf8');

	const jsInHtmlFile = __dirname + '/fixtures/javascript-in-html.html';
	const jsInHtmlCode = fs.readFileSync(jsInHtmlFile, 'utf8');

	const polymerFile = __dirname + '/fixtures/good-component.html';
	const polymerCode = fs.readFileSync(polymerFile, 'utf8');

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
					'banno/no-for-const': 'off',
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

		it('should check scripts inside HTML files', done => {
			eslint.check(jsInHtmlFile).then((results) => {
				const codes = results.map(({ code }) => code);
				expect(codes).toEqual(['no-undef', 'no-console']);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should work with Polymer components', done => {
			eslint.check(polymerFile).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should ignore non-JS (and non-HTML) files', done => {
			eslint.check(cssFile).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

	});

	describe('checkCode()', () => {

		it('should return a promise with an array of errors', (done) => {
			eslint.checkCode(badCode).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBeGreaterThan(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should have the expected error signature', (done) => {
			eslint.checkCode(badCode).then((results) => {
				expect(results[0]).toBeLintError();
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should return a promise with an empty array for lint-free code', (done) => {
			eslint.checkCode(goodCode).then((results) => {
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
					'banno/no-for-const': 'off',
					indent: 'off',
					'no-undef': 'off',
					'object-curly-spacing': 'off'
				}
			};
			eslint.checkCode(badCode, opts).then((results) => {
				expect(results).toEqual([]);
				done();
			});
		});

		it('should work when a language is defined', done => {
			eslint.checkCode(goodCode, { language: 'javascript' }).then(results => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should check scripts inside HTML code', done => {
			eslint.checkCode(jsInHtmlCode, { language: 'html' }).then((results) => {
				const codes = results.map(({ code }) => code);
				expect(codes).toEqual(['no-undef', 'no-console']);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should work with Polymer components', done => {
			eslint.checkCode(polymerCode, { language: 'html' }).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should ignore non-JS code', done => {
			eslint.checkCode(cssCode, { language: 'css' }).then(results => {
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

	describe('fixCode()', () => {

		it('should return a promise with a string', (done) => {
			eslint.fixCode(badCode).then((results) => {
				expect(results).toEqual(jasmine.any(String));
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should return a promise with the same code for lint-free code', (done) => {
			eslint.fixCode(goodCode).then((results) => {
				expect(results).toBe(goodCode);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should return a promise with the changed code for bad code', (done) => {
			eslint.fixCode(badCode).then((results) => {
				expect(results).toBe(fixedCode);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

	});

});
