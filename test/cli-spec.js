describe('CLI', function() {

	var proxyquire = require('proxyquire');
	var stub = {};

	var cli, checkFunc, fixFunc;
	var loadCli = function() {
		cli = proxyquire('../cli', stub);
	};

	beforeEach(function() {
		checkFunc = jasmine.createSpy('check()');
		fixFunc = jasmine.createSpy('fix()');
		stub['./'] = {
			check: checkFunc,
			fix: fixFunc
		};
	});

	it('should lint the "src" folder in the current directory by default', function() {
		loadCli();
		expect(checkFunc).toHaveBeenCalled();
		expect(checkFunc.calls.mostRecent().args[0]).toBe('src');
		expect(checkFunc.calls.mostRecent().args[1]).toEqual({});
		expect(checkFunc.calls.mostRecent().args[2]).toEqual(jasmine.any(Function));
	});

	it('should accept filenames for the source', function() {
		var files = ['foo', 'bar'];
		stub['minimist'] = function() { return { _: files }; };
		loadCli();
		expect(checkFunc).toHaveBeenCalled();
		expect(checkFunc.calls.mostRecent().args[0]).toEqual(files);
	});

	it('should fix the files when passed the --fix flag', function() {
		stub['minimist'] = function() { return { fix: true }; };
		loadCli();
		expect(fixFunc).toHaveBeenCalled();
	});

});
