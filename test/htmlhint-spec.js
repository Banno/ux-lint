/* eslint no-console: "off" */
'use strict';

const fs = require('fs-extra');

describe('html linter', () => {

	const linter = require('../linters/htmlhint');
	const customMatchers = require('./helpers/custom-matchers');

	const badFile  = __dirname + '/fixtures/bad-html.html';
	const badCode  = fs.readFileSync(badFile, 'utf8');
	const goodFile = __dirname + '/fixtures/good-html.html';
	const goodCode = fs.readFileSync(goodFile, 'utf8');
	const jsFile   = __dirname + '/fixtures/good-javascript.js';

	beforeEach(() => {
		jasmine.addMatchers(customMatchers);
	});

	describe('check()', () => {

		it('should return a promise with an array of errors', (done) => {
			linter.check(badFile).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBeGreaterThan(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should have the expected error signature', (done) => {
			linter.check(badFile).then((results) => {
				expect(results[0]).toBeLintError();
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should return a promise with an empty array for lint-free files', (done) => {
			linter.check(goodFile).then((results) => {
				expect(results).toEqual([]);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should accept options', (done) => {
			const opts = {
				// ignore all the errors
				'tag-pair': false
			};
			linter.check(badFile, opts).then((results) => {
				expect(results).toEqual([]);
				done();
			});
		});

		it('should ignore non-HTML files', done => {
			linter.check(jsFile).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		describe('custom rules', () => {

			it('should include the "banno/doc-lang" rule', done => {
				const badCustomFile = __dirname + '/fixtures/bad-doc-lang.html';
				const expectedNumErrors = 2;

				linter.check(badCustomFile).then(results => {
					expect(results).toEqual(jasmine.any(Array));
					expect(results.length).toBe(expectedNumErrors);
					done();
				}).catch((err) => {
					console.log('Error:', err.stack);
				});
			});

			it('should include the "banno/link-href" rule', done => {
				const badCustomFile = __dirname + '/fixtures/bad-links.html';
				const expectedNumErrors = 4;

				linter.check(badCustomFile).then(results => {
					expect(results).toEqual(jasmine.any(Array));
					expect(results.length).toBe(expectedNumErrors);
					done();
				}).catch((err) => {
					console.log('Error:', err.stack);
				});
			});

			it('should include the "banno/meta-charset-utf8" rule', done => {
				const badCustomFile = __dirname + '/fixtures/bad-meta-charset.html';
				const expectedNumErrors = 2;

				linter.check(badCustomFile).then(results => {
					expect(results).toEqual(jasmine.any(Array));
					expect(results.length).toBe(expectedNumErrors);
					done();
				}).catch((err) => {
					console.log('Error:', err.stack);
				});
			});

		});

	});

	describe('checkCode()', () => {

		it('should return a promise with an array of errors', (done) => {
			linter.checkCode(badCode).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBeGreaterThan(0);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should have the expected error signature', (done) => {
			linter.checkCode(badCode).then((results) => {
				expect(results[0]).toBeLintError();
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should return a promise with an empty array for lint-free code', (done) => {
			linter.checkCode(goodCode).then((results) => {
				expect(results).toEqual([]);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

		it('should accept options', (done) => {
			const opts = {
				// ignore all the errors
				'tag-pair': false
			};
			linter.checkCode(badCode, opts).then((results) => {
				expect(results).toEqual([]);
				done();
			});
		});

	});

	describe('fix()', () => {

		it('should act like check()', (done) => {
			linter.fix(badFile).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

	});

	describe('fixCode()', () => {

		it('should return the same code', (done) => {
			linter.fixCode(badCode).then((results) => {
				expect(results).toBe(badCode);
				done();
			}).catch((err) => {
				console.log('Error:', err.stack);
			});
		});

	});

});
