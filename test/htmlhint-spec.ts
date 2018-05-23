import * as fs from 'fs-extra'
import linter from '../src/linters/htmlhint'
import customMatchers from './helpers/custom-matchers'

describe('html linter', () => {

  const badFile = __dirname + '/fixtures/bad-html.html'
  const badCode = fs.readFileSync(badFile, 'utf8')
  const goodFile = __dirname + '/fixtures/good-html.html'
  const goodCode = fs.readFileSync(goodFile, 'utf8')
  const jsFile = __dirname + '/fixtures/good-javascript.js'

  beforeEach(() => {
    jasmine.addMatchers(customMatchers)
  })

  describe('check()', () => {

    it('should return a promise with an array of errors', async () => {
      const results = await linter.check([badFile])
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBeGreaterThan(0)
    })

    it('should have the expected error signature', async () => {
      const results = await linter.check([badFile])
      expect(results[0]).toBeLintError()
    })

    it('should return a promise with an empty array for lint-free files', async () => {
      const results = await linter.check([goodFile])
      expect(results).toEqual([])
    })

    it('should accept options', async () => {
      const opts: Options = {
        // ignore all the errors
        'tag-pair': false,
        'banno/link-href': false
      }
      const results = await linter.check([badFile], opts)
      expect(results).toEqual([])
    })

    it('should ignore non-HTML files', async () => {
      const results = await linter.check([jsFile])
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBe(0)
    })

    describe('custom rules', () => {

      it('should include the "banno/doc-lang" rule', async () => {
        const badCustomFile = __dirname + '/fixtures/bad-doc-lang.html'
        const expectedNumErrors = 2

        const results = await linter.check([badCustomFile])
        expect(results).toEqual(jasmine.any(Array))
        expect(results.length).toBe(expectedNumErrors)
      })

      it('should include the "banno/link-href" rule', async () => {
        const badCustomFile = __dirname + '/fixtures/bad-links.html'
        const expectedNumErrors = 4

        const results = await linter.check([badCustomFile])
        expect(results).toEqual(jasmine.any(Array))
        expect(results.length).toBe(expectedNumErrors)
      })

      it('should include the "banno/meta-charset-utf8" rule', async () => {
        const badCustomFile = __dirname + '/fixtures/bad-meta-charset.html'
        const expectedNumErrors = 2

        const results = await linter.check([badCustomFile])
        expect(results).toEqual(jasmine.any(Array))
        expect(results.length).toBe(expectedNumErrors)
      })

    })

  })

  describe('checkCode()', () => {

    it('should return a promise with an array of errors', async () => {
      const results = await linter.checkCode(badCode)
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBeGreaterThan(0)
    })

    it('should have the expected error signature', async () => {
      const results = await linter.checkCode(badCode)
      expect(results[0]).toBeLintError()
    })

    it('should return a promise with an empty array for lint-free code', async () => {
      const results = await linter.checkCode(goodCode)
      expect(results).toEqual([])
    })

    it('should accept options', async () => {
      const opts: Options = {
        // ignore all the errors
        'tag-pair': false,
        'banno/link-href': false
      }
      const results = await linter.checkCode(badCode, opts)
      expect(results).toEqual([])
    })

    it('should work when a language is defined', async () => {
      const results = await linter.checkCode(goodCode, { language: 'html' })
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBe(0)
    })

    it('should ignore non-HTML code', async () => {
      const results = await linter.checkCode(badCode, { language: 'javascript' })
      expect(results).toEqual(jasmine.any(Array))
      expect(results.length).toBe(0)
    })

  })

  describe('fix()', () => {

    it('should act like check()', async () => {
      const results = await linter.fix([badFile])
      expect(results).toEqual(jasmine.any(Array))
    })

  })

  describe('fixCode()', () => {

    it('should return the same code', async () => {
      const results = await linter.fixCode(badCode)
      expect(results).toBe(badCode)
    })

  })

})
