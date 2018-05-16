import * as styles from 'ansi-styles'
import reporter from '../src/reporters/stylish'

const escapeRegExp = (str: string) => {
  return str
    .replace('\\', '\\\\')
    .replace('[', '\\[')
}

describe('stylish reporter', () => {
  let results: LinterResult[] = [{
    plugin: 'eslint',
    type: 'error',
    code: '100',
    evidence: 'error code here',
    line: 1,
    character: 1,
    description: 'error description here',
    file: 'b-filename.js'
  }, {
    plugin: 'eslint',
    type: 'error',
    code: '300',
    evidence: '2nd error code here',
    line: 3,
    character: 1,
    description: '2nd error description here',
    file: 'b-filename.js'
  }, {
    plugin: 'eslint',
    type: 'warning',
    code: '200',
    evidence: 'warning code here',
    line: 2,
    character: 1,
    description: 'warning description here',
    file: 'a-filename.js'
  }, {
    plugin: 'eslint',
    type: 'warning',
    code: '200',
    evidence: 'warning code here',
    line: 2,
    character: 1,
    description: 'warning description here',
    file: null
  }]
  const errorIndex = 0
  const warningIndex = 2
  const numErrors = 2
  const numWarnings = 2

  const callReporter = (results: LinterResult[], opts?: Options) => {
    reporter(results.slice(0), opts) // the reporter modifies the array, so create a copy
    const spy = console.log as jasmine.Spy
    output = spy.calls.mostRecent().args[0]
  }

  let output: string

  beforeEach(async () => {
    spyOn(console, 'log')
    callReporter(results)
  })

  it('should sort the results', () => {
    expect(output).toMatch(/a-filename\.js[\s\S]*b-filename\.js/)
  })

  it('should print the plugin names in gray', () => {
    expect(output).toContain(`${styles.gray.open}${results[0].plugin}`)
  })

  it('should print the codes in gray', () => {
    results.forEach(result => {
      expect(output).toContain(`${styles.gray.open}${result.code}`)
    })
  })

  it('should print the line numbers in gray', () => {
    results.forEach(result => {
      expect(output).toContain(`${styles.gray.open}line ${result.line}`)
    })
  })

  it('should print the column numbers in gray', () => {
    results.forEach(result => {
      expect(output).toContain(`${styles.gray.open}col ${result.character}`)
    })
  })

  it('should print errors in red', () => {
    expect(output).toContain(`${styles.red.open}${results[errorIndex].description}`)
  })

  it('should print warnings in blue', () => {
    expect(output).toContain(`${styles.blue.open}${results[warningIndex].description}`)
  })

  it('should add filename headers', () => {
    const special = escapeRegExp(styles.underline.open)
    expect(output.match(new RegExp(`${special}a-filename\.js`, 'g'))!.length).toBe(1)
    expect(output.match(new RegExp(`${special}b-filename\.js`, 'g'))!.length).toBe(1)
  })

  it('should print the number of errors', () => {
    expect(output).toContain(`${numErrors} errors`)
  })

  it('should print the number of warnings', () => {
    expect(output).toContain(`${numWarnings} warnings`)
  })

  describe('when "verbose" is enabled', () => {
    beforeEach(() => {
      callReporter(results, { verbose: true })
    })

    it('should include the error code', () => {
      results.forEach(result => {
        expect(output).toContain(`${styles.gray.open}${result.code}`)
      })
    })
  })

  describe('when there are lint warnings, but no errors', () => {
    beforeEach(() => {
      callReporter([{
        plugin: 'eslint',
        type: 'warning',
        code: '200',
        evidence: 'warning code here',
        line: 2,
        character: 1,
        description: 'warning description here',
        file: 'a-filename.js'
      }])
    })

    it('should NOT print the number of errors', () => {
      expect(output).not.toMatch(/\d error/)
    })
  })

  describe('when there are lint errors, but no warnings', () => {
    beforeEach(() => {
      callReporter([{
        plugin: 'eslint',
        type: 'error',
        code: '200',
        evidence: 'warning code here',
        line: 2,
        character: 1,
        description: 'warning description here',
        file: 'a-filename.js'
      }])
    })

    it('should NOT print the number of warnings', () => {
      expect(output).not.toMatch(/\d warning/)
    })
  })

  describe('when there are no lint errors', () => {
    beforeEach(() => {
      callReporter([])
    })

    it('should print "No problems"', () => {
      expect(output).toContain('No problems')
    })
  })
});
