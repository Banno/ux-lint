import * as fs from 'fs'
import { capitalize, flatten, parseJson, readFiles, sort as sortFunc, toArray } from '../src/helper'

describe('helper functions', () => {
  describe('capitalize()', () => {
    it('should not do anything to an empty string', () => {
      expect(capitalize('')).toBe('')
    })

    it('should convert the first character to uppercase', () => {
      expect(capitalize('abcd')).toBe('Abcd')
      expect(capitalize('ABCD')).toBe('ABCD')
      expect(capitalize('1234')).toBe('1234')
      expect(capitalize('* other string ')).toBe('* other string ')
    })
  })

  describe('flatten()', () => {
    it('should throw an error if argument is not an array', () => {
      expect(() => {
        flatten(null as any)
      }).toThrow()
    })

    it('should return the array unchanged if there are no nested arrays', () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3])
    })

    it('should flatten an array of arrays', () => {
      expect(flatten([[1, 2], [3, 4], 5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('parseJson()', () => {
    it('should parse an HJSON file', () => {
      const parsed = parseJson(__dirname + '/../config/eslint.hjson')
      expect(parsed).toEqual(jasmine.any(Object))
      expect(parsed.globals).toBeDefined()
    })

    it('should throw an error if the file does not exist', () => {
      expect(() => {
        parseJson('nonexistent.json')
      }).toThrow()
    })

    it('should NOT throw an error if "ignoreErrors" is set', () => {
      expect(() => {
        parseJson('nonexistent.json', { ignoreErrors: true })
      }).not.toThrow()
    })
  })

  describe('readFiles()', () => {
    let filename: string
    let contents: string

    beforeEach(() => {
      filename = __dirname + '/fixtures/bad-javascript.js'
      contents = fs.readFileSync(filename, 'utf8')
    })

    it('should return a promise', () => {
      expect(readFiles(filename)).toEqual(jasmine.any(Promise))
    })

    it('should filter out non-files', () => {
      return readFiles('.').then((results) => {
        expect(results).toEqual([])
      })
    })

    it('should resolve to an array with the file contents object', () => {
      return readFiles(filename).then((results) => {
        expect(results).toEqual(jasmine.any(Array))
        expect(results.length).toBe(1)
        expect(results[0].file).toBe(filename)
        expect(results[0].contents).toBe(contents)
      })
    })

    it('should resolve to an empty array if there are no matching files', () => {
      return readFiles('nonmatching.pattern').then((results) => {
        expect(results).toEqual([])
      })
    })

    it('should support an array of patterns', () => {
      const files = [
        'test/fixtures/bad-javascript.js',
        'test/fixtures/good-javascript.js'
      ]
      return readFiles(files).then((results) => {
        expect(results).toEqual(jasmine.any(Array))
        expect(results.length).toBe(files.length)
      })
    })

    it('should resolve to an empty array if an invalid pattern is used', () => {
      return readFiles(null as any).then((results) => {
        expect(results).toEqual([])
      })
    })
  })

  describe('sort()', () => {
    let errors: LinterResult[]
    let expected: LinterResult[]

    beforeEach(() => {
      errors = [
        { file: null, line: 83, character: 21, plugin: 'jshint' } as LinterResult,
        { file: 'a', line: 67, character: 84, plugin: 'jshint' } as LinterResult,
        { file: 'a', line: 41, character: 100, plugin: 'jshint' } as LinterResult,
        { file: 'a', line: 12, character: 56, plugin: 'jscs' } as LinterResult,
        { file: 'a', line: 69, character: 91, plugin: 'jshint' } as LinterResult,
        { file: 'a', line: 95, character: 52, plugin: 'jshint' } as LinterResult,
        { file: 'a', line: 95, character: 45, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 87, character: 3, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 18, character: 73, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 18, character: 73, plugin: 'jscs' } as LinterResult,
        { file: 'b', line: 52, character: 77, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 93, character: 31, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 93, character: 71, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 93, character: 59, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 93, character: 59, plugin: 'jscs' } as LinterResult,
        { file: 'b', line: 93, character: 59, plugin: 'jshint' } as LinterResult
      ]
      expected = [
        { file: null, line: 83, character: 21, plugin: 'jshint' } as LinterResult,

        { file: 'a', line: 12, character: 56, plugin: 'jscs' } as LinterResult,
        { file: 'a', line: 41, character: 100, plugin: 'jshint' } as LinterResult,
        { file: 'a', line: 67, character: 84, plugin: 'jshint' } as LinterResult,
        { file: 'a', line: 69, character: 91, plugin: 'jshint' } as LinterResult,
        { file: 'a', line: 95, character: 45, plugin: 'jshint' } as LinterResult,
        { file: 'a', line: 95, character: 52, plugin: 'jshint' } as LinterResult,

        { file: 'b', line: 18, character: 73, plugin: 'jscs' } as LinterResult,
        { file: 'b', line: 18, character: 73, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 52, character: 77, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 87, character: 3, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 93, character: 31, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 93, character: 59, plugin: 'jscs' } as LinterResult,
        { file: 'b', line: 93, character: 59, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 93, character: 59, plugin: 'jshint' } as LinterResult,
        { file: 'b', line: 93, character: 71, plugin: 'jshint' } as LinterResult
      ]
    })

    it('should sort arrays by file, line, column, then plugin', () => {
      errors.sort(sortFunc)
      expect(errors).toEqual(expected)
    })
  })

  describe('toArray()', () => {
    it('should wrap a scalar inside an array', () => {
      expect(toArray(true)).toEqual([true])
      expect(toArray(null)).toEqual([null])
      expect(toArray(3)).toEqual([3])
      expect(toArray('foo')).toEqual(['foo'])
      expect(toArray({ foo: 1 })).toEqual([{ foo: 1 }])
    })

    it('should not change an array', () => {
      expect(toArray([1, 2, 3])).toEqual([1, 2, 3])
    })
  })
})
