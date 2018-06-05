import * as del from 'del'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as tempfile from 'tempfile'
import eslint from '../src/linters/eslint'
import { Options } from '../src/options'
import customMatchers from './helpers/custom-matchers'

describe('eslint linter', () => {
  const badFile = __dirname + '/fixtures/bad-javascript.js'
  const badCode = fs.readFileSync(badFile, 'utf8')

  const cssFile = __dirname + '/fixtures/good-css.css'
  const cssCode = fs.readFileSync(cssFile, 'utf8')

  const fixedFile = __dirname + '/fixtures/fixed-javascript.js'
  const fixedCode = fs.readFileSync(fixedFile, 'utf8')

  const goodFile = __dirname + '/fixtures/good-javascript.js'
  const goodCode = fs.readFileSync(goodFile, 'utf8')

  const jsInHtmlFile = __dirname + '/fixtures/javascript-in-html.html'
  const jsInHtmlCode = fs.readFileSync(jsInHtmlFile, 'utf8')

  const polymerFile = __dirname + '/fixtures/good-component.html'
  const polymerCode = fs.readFileSync(polymerFile, 'utf8')

  beforeEach(() => {
    jasmine.addMatchers(customMatchers)
  })

  describe('check()', () => {

    it('should return a promise with an array of errors', async () => {
      const results = await eslint.check([badFile])
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBeGreaterThan(0)
    })

    it('should have the expected error signature', async () => {
      const results = await eslint.check([badFile])
      expect(results[0]).toBeLintError()
    })

    it('should return a promise with an empty array for lint-free files', async () => {
      const results = await eslint.check([goodFile])
      expect(results).toEqual([])
    })

    it('should accept options', async () => {
      const opts: Options = {
        // ignore all the errors
        rules: {
          'banno/no-for-const': 'off',
          indent: 'off',
          'no-undef': 'off',
          'object-curly-spacing': 'off'
        }
      }
      const results = await eslint.check([badFile], opts)
      expect(results).toEqual([])
    })

    it('should set less severe problems as "warning"', async () => {
      const opts: Options = {
        rules: {
          // Set indent check to 4 spaces, with "warning" severity
          indent: [1, 4],
          // Ignore other errors
          'banno/no-for-const': 'off',
          'no-undef': 'off',
          'object-curly-spacing': 'off'
        }
      }
      const results = await eslint.check([badFile], opts)
      expect(results[0].code).toBe('indent')
      expect(results[0].type).toBe('warning')
    })

    it('should include dotfiles', async () => {
      const tempFolder = './.tmp'
      const tempFile = path.join(tempFolder, goodFile)
      fs.mkdirSync(tempFolder)
      fs.copySync(goodFile, tempFile)
      const results = await eslint.check([tempFile])
      expect(results).toEqual([])
      del.sync(tempFolder)
    })

    it('should check scripts inside HTML files', async () => {
      const results = await eslint.check([jsInHtmlFile])
      const codes = results.map(({ code }) => code)
      expect(codes).toEqual(['no-undef', 'no-console'])
    })

    it('should work with Polymer components', async () => {
      const results = await eslint.check([polymerFile])
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBe(0)
    })

    it('should ignore non-JS (and non-HTML) files', async () => {
      const results = await eslint.check([cssFile])
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBe(0)
    })

  })

  describe('checkCode()', () => {

    it('should return a promise with an array of errors', async () => {
      const results = await eslint.checkCode(badCode)
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBeGreaterThan(0)
    })

    it('should have the expected error signature', async () => {
      const results = await eslint.checkCode(badCode)
      expect(results[0]).toBeLintError()
    })

    it('should return a promise with an empty array for lint-free code', async () => {
      const results = await eslint.checkCode(goodCode)
      expect(results).toEqual([])
    })

    it('should accept options', async () => {
      const opts: Options = {
        // ignore all the errors
        rules: {
          'banno/no-for-const': 'off',
          indent: 'off',
          'no-undef': 'off',
          'object-curly-spacing': 'off'
        }
      }
      const results = await eslint.checkCode(badCode, opts)
      expect(results).toEqual([])
    })

    it('should work when a language is defined', async () => {
      const results = await eslint.checkCode(goodCode, { language: 'javascript' })
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBe(0)
    })

    it('should check scripts inside HTML code', async () => {
      const results = await eslint.checkCode(jsInHtmlCode, { language: 'html' })
      const codes = results.map(({ code }) => code)
      expect(codes).toEqual(['no-undef', 'no-console'])
    })

    it('should work with Polymer components', async () => {
      const results = await eslint.checkCode(polymerCode, { language: 'html' })
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBe(0)
    })

    it('should ignore non-JS code', async () => {
      const results = await eslint.checkCode(cssCode, { language: 'css' })
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBe(0)
    })

  })

  describe('fix()', () => {

    let tempFilename: string
    let originalContents: string
    let fixedContents: string

    beforeEach(() => {
      tempFilename = tempfile('.js')
      fs.copySync(badFile, tempFilename)
      originalContents = fs.readFileSync(tempFilename, { encoding: 'utf8' })
    })

    afterEach(() => {
      fixedContents = fs.readFileSync(tempFilename, { encoding: 'utf8' })
      fs.removeSync(tempFilename)
    })

    it('should return a promise with an array', async () => {
      const results = await eslint.fix([tempFilename])
      expect(results).toEqual(jasmine.any(Array))
    })

    it('should include problems that cannot be fixed automatically', async () => {
      const results = await eslint.fix([tempFilename])
      expect(results.length).toBeGreaterThan(0)
    })

    it('should update the file with the fixes', async () => {
      await eslint.fix([tempFilename])
      expect(fixedContents).not.toBe(originalContents)
    })

  })

  describe('fixCode()', () => {

    it('should return a promise with a string', async () => {
      const results = await eslint.fixCode(badCode)
      expect(results).toEqual(jasmine.any(String))
    })

    it('should return a promise with the same code for lint-free code', async () => {
      const results = await eslint.fixCode(goodCode)
      expect(results).toBe(goodCode)
    })

    it('should return a promise with the changed code for bad code', async () => {
      const results = await eslint.fixCode(badCode)
      expect(results).toBe(fixedCode)
    })

  })

})
