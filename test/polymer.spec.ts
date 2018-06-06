import * as fs from 'fs-extra'
import { Options } from '../src/options'
import polymer from '../src/linters/polymer'
import customMatchers from './helpers/custom-matchers'

describe('polymer linter', () => {
  const badFile = __dirname + '/fixtures/bad-component.html'
  const badCode = fs.readFileSync(badFile, 'utf8')
  const goodFile = __dirname + '/fixtures/good-component.html'
  const goodCode = fs.readFileSync(goodFile, 'utf8')
  const otherFile = __dirname + '/fixtures/good-html.html'
  const goodIcon = __dirname + '/fixtures/good-icon.html'

  beforeEach(() => {
    jasmine.addMatchers(customMatchers)
  })

  describe('check()', () => {
    it('should return a promise with an array of errors', async () => {
      const results = await polymer.check([badFile])
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBeGreaterThan(0)
    })

    it('should have the expected error signature', async () => {
      const results = await polymer.check([badFile])
      expect(results[0]).toBeLintError()
    })

    it('should return a promise with an empty array for lint-free files', async () => {
      const results = await polymer.check([goodFile])
      expect(results).toEqual([])
    })

    it('should accept options', async () => {
      const opts: Options = {
        // ignore all the errors
        rules: {
          'component-name-matches-filename': false,
          'style-inside-template': false
        }
      }
      const results = await polymer.check([badFile], opts)
      expect(results).toEqual([])
    })

    it('should only check against the given rules', async () => {
      const opts: Options = {
        rules: {
          'component-name-matches-filename': false,
          'style-inside-template': true
        }
      }
      const results = await polymer.check([badFile], opts)
      results.forEach(result => {
        expect(result.code).toBe('style-inside-template')
      })
    })

    it('should ignore non-Polymer files', async () => {
      const results = await polymer.check([otherFile])
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBe(0)
    })

    it('should include icon-titles rule', async () => {
      const results = await polymer.check([badFile])
      const errorCodes = results.map(r => r.code)
      expect(errorCodes).toContain('icon-titles')
    })

    it('should include icon-titles rule, without false positives', async () => {
      const results = await polymer.check([goodIcon])
      const errorCodes = results.map(r => r.code)
      expect(errorCodes).not.toContain('icon-titles')
    })
  })

  describe('checkCode()', () => {
    it('should return a promise with an array of errors', async () => {
      const results = await polymer.checkCode(badCode)
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBeGreaterThan(0)
    })

    it('should have the expected error signature', async () => {
      const results = await polymer.checkCode(badCode)
      expect(results[0]).toBeLintError()
    })

    it('should return a promise with an empty array for lint-free code', async () => {
      const results = await polymer.checkCode(goodCode)
      expect(results).toEqual([])
    })

    it('should accept options', async () => {
      const opts: Options = {
        // ignore all the errors
        rules: {
          'component-name-matches-filename': false,
          'style-inside-template': false
        }
      }
      const results = await polymer.checkCode(badCode, opts)
      expect(results).toEqual([])
    })

    it('should work when a language is defined', async () => {
      const results = await polymer.checkCode(goodCode, { language: 'html' })
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBe(0)
    })

    it('should ignore non-HTML code', async () => {
      const results = await polymer.checkCode(badCode, { language: 'javascript' })
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBe(0)
    })
  })

  describe('fix()', () => {
    it('should act like check()', async () => {
      const results = await polymer.fix([badFile])
      expect(results).toEqual(jasmine.any(Array))
    })
  })

  describe('fixCode()', () => {
    it('should return the same code', async () => {
      const results = await polymer.fixCode(badCode)
      expect(results).toBe(badCode)
    })
  })
})
