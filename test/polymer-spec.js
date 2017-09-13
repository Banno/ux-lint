/* eslint no-console: "off" */
'use strict';

const fs = require('fs-extra');

describe('polymer linter', () => {

	const polymer = require('../linters/polymer');
	const customMatchers = require('./helpers/custom-matchers');

	const badFile = __dirname + '/fixtures/bad-component.html';
	const badCode = fs.readFileSync(badFile, 'utf8');
	const goodFile = __dirname + '/fixtures/good-component.html';
	const goodCode = fs.readFileSync(goodFile, 'utf8');
	const otherFile = __dirname + '/fixtures/good-html.html';
	const goodIcon = __dirname + '/fixtures/good-icon.html';

	beforeEach(() => {
		jasmine.addMatchers(customMatchers);
	});

	describe('check()', () => {

		it('should return a promise with an array of errors', (done) => {
			polymer.check(badFile).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBeGreaterThan(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should have the expected error signature', (done) => {
			polymer.check(badFile).then((results) => {
				expect(results[0]).toBeLintError();
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should return a promise with an empty array for lint-free files', (done) => {
			polymer.check(goodFile).then((results) => {
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
					'component-name-matches-filename': false,
					'style-inside-template': false
				}
			};
			polymer.check(badFile, opts).then((results) => {
				expect(results).toEqual([]);
				done();
			});
		});

		it('should ignore non-Polymer files', done => {
			polymer.check(otherFile).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should include icon-titles rule', done => {
			polymer.check(badFile).then((results) => {
				const errorCodes = results.map(r => r.code);
				expect(errorCodes).toContain('icon-titles');
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should include icon-titles rule, without false positives', done => {
			polymer.check(goodIcon).then((results) => {
				const errorCodes = results.map(r => r.code);
				expect(errorCodes).not.toContain('icon-titles');
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});
	});

	describe('checkCode()', () => {

		it('should return a promise with an array of errors', (done) => {
			polymer.checkCode(badCode).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBeGreaterThan(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should have the expected error signature', (done) => {
			polymer.checkCode(badCode).then((results) => {
				expect(results[0]).toBeLintError();
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should return a promise with an empty array for lint-free code', (done) => {
			polymer.checkCode(goodCode).then((results) => {
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
					'component-name-matches-filename': false,
					'style-inside-template': false
				}
			};
			polymer.checkCode(badCode, opts).then((results) => {
				expect(results).toEqual([]);
				done();
			});
		});

		it('should work when a language is defined', done => {
			polymer.checkCode(goodCode, { language: 'html' }).then(results => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should ignore non-HTML code', done => {
			polymer.checkCode(badCode, { language: 'javascript' }).then(results => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

	});

	describe('fix()', () => {

		it('should act like check()', (done) => {
			polymer.fix(badFile).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

	});

	describe('fixCode()', () => {

		it('should return the same code', (done) => {
			polymer.fixCode(badCode).then((results) => {
				expect(results).toBe(badCode);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

	});

});
