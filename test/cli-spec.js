'use strict';
describe('CLI', function() {

	var extend = require('extend');
	var proxyquire = require('proxyquire');
	var stub = {};

	var checkFunc, fixFunc;
	var loadCli = function() {
		proxyquire('../cli', stub);
	};

	beforeEach(function() {
		checkFunc = jasmine.createSpy('check()');
		fixFunc = jasmine.createSpy('fix()');
		stub['./'] = {
			check: checkFunc,
			fix: fixFunc,
		};
		stub['./reporters/stylish'] = jasmine.createSpy('reporter');
	});

	it('should lint the "src" folder in the current directory by default', function() {
		loadCli();
		expect(checkFunc).toHaveBeenCalled();
		expect(checkFunc.calls.mostRecent().args[0]).toEqual(['src/**/*.js', '*.js']);
		expect(checkFunc.calls.mostRecent().args[1]).toEqual({});
		expect(checkFunc.calls.mostRecent().args[2]).toEqual(jasmine.any(Function));
	});

	it('should accept filenames for the source', function() {
		var files = ['foo', 'bar'];
		stub.minimist = function() { return { _: files }; };
		loadCli();
		expect(checkFunc).toHaveBeenCalled();
		expect(checkFunc.calls.mostRecent().args[0]).toEqual(files);
	});

	it('should fix the files when passed the --fix flag', function() {
		stub.minimist = function() { return { fix: true }; };
		loadCli();
		expect(fixFunc).toHaveBeenCalled();
	});

	describe('--extend', function() {

		it('should read in the specified file', function() {
			var opts = { foo: 'bar' };
			stub.minimist = function() { return { extend: '1.json' }; };
			stub['./helper'] = { parseJson: function() { return opts; } };
			loadCli();
			expect(checkFunc.calls.mostRecent().args[1]).toEqual(opts);
		});

		it('should work with multiple files', function() {
			var i = 0;
			var opts = [{ foo: 'bar' }, { foo: 'arb', foo2: 'baz' }];
			stub.minimist = function() { return { extend: ['1.json', '2.json'] }; };
			stub['./helper'] = { parseJson: function(filename) { return opts[i++]; } };
			loadCli();
			expect(checkFunc.calls.mostRecent().args[1]).toEqual(extend({}, opts[0], opts[1]));
		});

	});

	describe('when there are no lint errors', function() {

		beforeEach(function() {
			checkFunc.and.callFake(function(files, opts, callback) {
				callback(null, []);
			});
			loadCli();
		});

		it('should return an exit code of 0', function() {
			expect(process.exitCode).toBe(0);
		});

	});

	describe('when there are lint errors', function() {

		var numErrors = 17;

		beforeEach(function() {
			checkFunc.and.callFake(function(files, opts, callback) {
				var results = [];
				results.length = numErrors;
				results.fill({});
				callback(null, results);
			});
			loadCli();
		});

		it('should return an exit code equal to the number of errors', function() {
			expect(process.exitCode).toBe(numErrors);
		});

	});

});
