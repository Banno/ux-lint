'use strict';

const fs = require('fs');

describe('helper functions', () => {

	describe('flatten()', () => {

		const flatten = require('../helper').flatten;

		it('should throw an error if argument is not an array', () => {
			expect(() => {
				flatten(null);
			}).toThrow();
		});

		it('should return the array unchanged if there are no nested arrays', () => {
			/* eslint-disable no-magic-numbers */
			expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
			/* eslint-enable no-magic-numbers */
		});

		it('should flatten an array of arrays', () => {
			/* eslint-disable no-magic-numbers */
			expect(flatten([[1, 2], [3, 4], 5])).toEqual([1, 2, 3, 4, 5]);
			/* eslint-enable no-magic-numbers */
		});

	});

	describe('parseJson()', () => {

		const parseJson = require('../helper').parseJson;

		it('should parse an HJSON file', () => {
			const parsed = parseJson(__dirname + '/../config/eslint.hjson');
			expect(parsed).toEqual(jasmine.any(Object));
			expect(parsed.globals).toBeDefined();
		});

		it('should throw an error if the file does not exist', () => {
			expect(() => {
				parseJson('nonexistent.json');
			}).toThrow();
		});

		it('should NOT throw an error if "ignoreErrors" is set', () => {
			expect(() => {
				parseJson('nonexistent.json', { ignoreErrors: true });
			}).not.toThrow();
		});

	});

	describe('readFiles()', () => {

		const readFiles = require('../helper').readFiles;
		let filename, contents;

		beforeEach(() => {
			filename = __dirname + '/fixtures/bad-javascript.js';
			contents = fs.readFileSync(filename, 'utf8');
		});

		it('should return a promise', () => {
			expect(readFiles(filename)).toEqual(jasmine.any(Promise));
		});

		it('should filter out non-files', (done) => {
			readFiles('.').then((results) => {
				expect(results).toEqual([]);
				done();
			});
		});

		it('should resolve to an array with the file contents object', (done) => {
			readFiles(filename).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(1);
				expect(results[0].file).toBe(filename);
				expect(results[0].contents).toBe(contents);
				done();
			});
		});

		it('should resolve to an empty array if there are no matching files', (done) => {
			readFiles('nonmatching.pattern').then((results) => {
				expect(results).toEqual([]);
				done();
			});
		});

		it('should support an array of patterns', (done) => {
			const files = [
				'test/fixtures/bad-javascript.js',
				'test/fixtures/good-javascript.js'
			];
			readFiles(files).then((results) => {
				expect(results).toEqual(jasmine.any(Array));
				expect(results.length).toBe(files.length);
				done();
			});
		});

		it('should resolve to an empty array if an invalid pattern is used', (done) => {
			readFiles(null).then((results) => {
				expect(results).toEqual([]);
				done();
			});
		});

	});

	describe('sort()', () => {

		const sortFunc = require('../helper').sort;

		let errors, expected;

		beforeEach(() => {
			errors = [
				{ file: 'a', line: 67, character: 84, plugin: 'jshint' },
				{ file: 'a', line: 41, character: 100, plugin: 'jshint' },
				{ file: 'a', line: 12, character: 56, plugin: 'jscs' },
				{ file: 'a', line: 69, character: 91, plugin: 'jshint' },
				{ file: 'a', line: 95, character: 52, plugin: 'jshint' },
				{ file: 'a', line: 95, character: 45, plugin: 'jshint' },
				{ file: 'b', line: 87, character: 3, plugin: 'jshint' },
				{ file: 'b', line: 18, character: 73, plugin: 'jscs' },
				{ file: 'b', line: 52, character: 77, plugin: 'jshint' },
				{ file: 'b', line: 93, character: 31, plugin: 'jshint' },
				{ file: 'b', line: 93, character: 71, plugin: 'jshint' },
				{ file: 'b', line: 93, character: 59, plugin: 'jscs' },
			];
			expected = [
				{ file: 'a', line: 12, character: 56, plugin: 'jscs' },
				{ file: 'a', line: 41, character: 100, plugin: 'jshint' },
				{ file: 'a', line: 67, character: 84, plugin: 'jshint' },
				{ file: 'a', line: 69, character: 91, plugin: 'jshint' },
				{ file: 'a', line: 95, character: 45, plugin: 'jshint' },
				{ file: 'a', line: 95, character: 52, plugin: 'jshint' },

				{ file: 'b', line: 18, character: 73, plugin: 'jscs' },
				{ file: 'b', line: 52, character: 77, plugin: 'jshint' },
				{ file: 'b', line: 87, character: 3, plugin: 'jshint' },
				{ file: 'b', line: 93, character: 31, plugin: 'jshint' },
				{ file: 'b', line: 93, character: 59, plugin: 'jscs' },
				{ file: 'b', line: 93, character: 71, plugin: 'jshint' },
			];
		});

		it('should sort arrays by file, line, column, then plugin', () => {
			errors.sort(sortFunc);
			expect(errors).toEqual(expected);
		});

	});

});
