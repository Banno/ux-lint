import * as proxyquire from 'proxyquire'

describe('CLI', () => {
  let stub: Stub = {}

  let checkFunc: jasmine.Spy
  let fixFunc: jasmine.Spy
  const loadCli = () => {
    const run = proxyquire('../src/cli', stub).run
    return run()
  }

  beforeEach(() => {
    checkFunc = jasmine.createSpy('check()').and.returnValue(Promise.resolve([]))
    fixFunc = jasmine.createSpy('fix()').and.returnValue(Promise.resolve([]))
    stub['./'] = {
      allLinters: {
        check: checkFunc,
        fix: fixFunc
      }
    }
    stub['./reporters/stylish'] = {
      default: jasmine.createSpy('reporter')
    }
    spyOn(console, 'log')
  })

  it('should lint the "src" folder in the current directory by default', () => {
    return loadCli().then(() => {
      expect(checkFunc).toHaveBeenCalled()
      expect(checkFunc.calls.mostRecent().args[0]).toEqual(['src/**/*.js', '*.js'])
      expect(checkFunc.calls.mostRecent().args[1]).toEqual({})
    })
  })

  it('should accept filenames for the source', () => {
    const files = ['foo', 'bar']
    stub.minimist = () => { return { _: files } }
    return loadCli().then(() => {
      expect(checkFunc).toHaveBeenCalled()
      expect(checkFunc.calls.mostRecent().args[0]).toEqual(files)
    })
  })

  it('should fix the files when passed the --fix flag', () => {
    stub.minimist = () => { return { fix: true } }
    return loadCli().then(() => {
      expect(fixFunc).toHaveBeenCalled()
    })
  })

  describe('--extend', () => {
    it('should read in the specified file', () => {
      const opts = { foo: 'bar' }
      stub.minimist = () => { return { extend: '1.json' } }
      stub['./helper'] = { parseJson: () => { return opts } }
      return loadCli().then(() => {
        expect(checkFunc.calls.mostRecent().args[1]).toEqual(opts)
      })
    })

    it('should work with multiple files', () => {
      let i = 0
      const opts = [{ foo: 'bar' }, { foo: 'arb', foo2: 'baz' }]
      stub.minimist = () => { return { extend: ['1.json', '2.json'] } }
      stub['./helper'] = { parseJson: (filename: string) => { return opts[i++] } }
      return loadCli().then(() => {
        expect(checkFunc.calls.mostRecent().args[1]).toEqual(Object.assign({}, opts[0], opts[1]))
      })
    })
  })

  describe('--help', () => {
    beforeEach(() => {
      stub.minimist = () => { return { help: true } }
      return loadCli()
    })

    it('should print the usage information', () => {
      const spy = console.log as jasmine.Spy
      expect(spy).toHaveBeenCalled()
      expect(spy.calls.mostRecent().args[0]).toContain('ux-lint [options]')
    })
  })

  describe('when there are no lint errors', () => {
    beforeEach(() => {
      return loadCli()
    })

    it('should return an exit code of 0', () => {
      expect(process.exitCode).toBe(0)
    })
  })

  describe('when an unexpected error occurs', () => {
    beforeEach(() => {
      checkFunc.and.returnValue(Promise.reject(new Error('test error')))
      return loadCli()
    })

    it('should print the error', () => {
      const spy = console.log as jasmine.Spy
      expect(spy).toHaveBeenCalled()
      expect(spy.calls.mostRecent().args[0]).toContain('test error')
    })
  })

})
