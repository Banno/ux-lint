/* eslint no-console: "off" */
'use strict';

describe('polymer linter', () => {

	const polymer = require('../linters/polymer');
	const customMatchers = require('./helpers/custom-matchers');

	const badFile  = __dirname + '/fixtures/bad-component.html';
	const goodFile = __dirname + '/fixtures/good-component.html';
	const otherFile = __dirname + '/fixtures/good-html.html';

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

});
