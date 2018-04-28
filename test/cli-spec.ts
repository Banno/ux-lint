import * as proxyquire from 'proxyquire'

describe('CLI', () => {

  let stub: Stub = {};

  let checkFunc: jasmine.Spy
  let fixFunc: jasmine.Spy
  const loadCli = () => {
    proxyquire('../src/cli', stub);
  };

  beforeEach(() => {
    checkFunc = jasmine.createSpy('check()').and.returnValue(Promise.resolve([]));
    fixFunc = jasmine.createSpy('fix()').and.returnValue(Promise.resolve([]));
    stub['./'] = {
      allLinters: {
        check: checkFunc,
        fix: fixFunc,
      }
    };
    stub['./reporters/stylish'] = {
      default: jasmine.createSpy('reporter')
    }
  });

  it('should lint the "src" folder in the current directory by default', () => {
    loadCli();
    expect(checkFunc).toHaveBeenCalled();
    expect(checkFunc.calls.mostRecent().args[0]).toEqual(['src/**/*.js', '*.js']);
    expect(checkFunc.calls.mostRecent().args[1]).toEqual({});
  });

  it('should accept filenames for the source', () => {
    const files = ['foo', 'bar'];
    stub.minimist = () => { return { _: files }; };
    loadCli();
    expect(checkFunc).toHaveBeenCalled();
    expect(checkFunc.calls.mostRecent().args[0]).toEqual(files);
  });

  it('should fix the files when passed the --fix flag', () => {
    stub.minimist = () => { return { fix: true }; };
    loadCli();
    expect(fixFunc).toHaveBeenCalled();
  });

  describe('--extend', () => {

    it('should read in the specified file', () => {
      const opts = { foo: 'bar' };
      stub.minimist = () => { return { extend: '1.json' }; };
      stub['./helper'] = { parseJson: () => { return opts; } };
      loadCli();
      expect(checkFunc.calls.mostRecent().args[1]).toEqual(opts);
    });

    it('should work with multiple files', () => {
      let i = 0;
      const opts = [{ foo: 'bar' }, { foo: 'arb', foo2: 'baz' }];
      stub.minimist = () => { return { extend: ['1.json', '2.json'] }; };
      stub['./helper'] = { parseJson: (filename: string) => { return opts[i++]; } };
      loadCli();
      expect(checkFunc.calls.mostRecent().args[1]).toEqual(Object.assign({}, opts[0], opts[1]));
    });

  });

  describe('when there are no lint errors', () => {

    beforeEach(() => {
      loadCli();
    });

    it('should return an exit code of 0', () => {
      expect(process.exitCode).toBe(0);
    });

  });

});
