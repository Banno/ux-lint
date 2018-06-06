import * as fs from 'fs-extra'
import * as tempfile from 'tempfile'
import * as linter from '../src/index'
import customMatchers from './helpers/custom-matchers'

describe('JS API', () => {
  const badFile = __dirname + '/fixtures/bad-javascript.js'
  const badCode = fs.readFileSync(badFile, 'utf8')
  const fixedFile = __dirname + '/fixtures/fixed-javascript.js'
  const fixedCode = fs.readFileSync(fixedFile, 'utf8')

  beforeEach(() => {
    jasmine.addMatchers(customMatchers)
  })

  describe('check()', () => {
    it('should not throw an error when successful', async () => {
      await linter.check([badFile])
    })

    it('should return an array of linter errors', async () => {
      const results = await linter.check([badFile])
      expect(results).toEqual(jasmine.any(Array))
      expect(results[0]).toBeLintError()
    })

    it('should accept options as an optional argument', async () => {
      const results = await linter.check([badFile], {})
      expect(results).toEqual(jasmine.any(Array))
      expect(results[0]).toBeLintError()
    })

    it('should return empty results if given a file pattern that doesn\'t match anything', async () => {
      const results = await linter.check(['supercalifragilisticexpialidocious'])
      expect(results).toEqual([])
    })
  })

  describe('checkCode()', () => {
    it('should not throw an error when successful', async () => {
      await linter.checkCode(badCode)
    })

    it('should return an array of linter errors', async () => {
      const results = await linter.checkCode(badCode)
      expect(results).toEqual(jasmine.any(Array))
      expect(results[0]).toBeLintError()
    })

    it('should accept options as an optional argument', async () => {
      const results = await linter.checkCode(badCode, {})
      expect(results).toEqual(jasmine.any(Array))
      expect(results[0]).toBeLintError()
    })

    it('should pass along the "language" option to the linters', async () => {
      const goodFile = __dirname + '/fixtures/good-component.html'
      const goodCode = fs.readFileSync(goodFile, 'utf8')
      const results = await linter.checkCode(goodCode, { language: 'html' })
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBe(0)
    })
  })

  describe('fix()', () => {
    let tempFilename: string
    let fixedContents: string

    beforeEach(() => {
      tempFilename = tempfile('.js')
      fs.copySync(badFile, tempFilename)
    })

    afterEach(() => {
      fixedContents = fs.readFileSync(tempFilename, { encoding: 'utf8' })
      fs.removeSync(tempFilename)
    })

    it('should not throw an error when successful', async () => {
      await linter.fix([tempFilename])
    })

    it('should return an array', async () => {
      const results = await linter.fix([tempFilename])
      expect(results).toEqual(jasmine.any(Array))
    })

    it('should update the file with the fixes', async () => {
      await linter.fix([tempFilename])
      expect(fixedContents).toBe(fixedCode)
    })

    it('should accept options as an optional argument', async () => {
      const results = await linter.fix([tempFilename], {})
      expect(results).toEqual(jasmine.any(Array))
    })

    it('should return empty results if given a file pattern that doesn\'t match anything', async () => {
      const results = await linter.check(['supercalifragilisticexpialidocious'])
      expect(results).toEqual([])
    })
  })

  describe('fixCode()', () => {
    it('should set the error object to null when successful', async () => {
      await linter.fixCode(badCode)
    })

    it('should return a string', async () => {
      const results = await linter.fixCode(badCode)
      expect(results).toEqual(jasmine.any(String))
    })

    it('should update the file with the fixes', async () => {
      const results = await linter.fixCode(badCode)
      expect(results).toBe(fixedCode)
    })

    it('should accept options as an optional argument', async () => {
      const results = await linter.fixCode(badCode, {})
      expect(results).toBe(fixedCode)
    })
  })
})
