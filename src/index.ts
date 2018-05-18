import { flatten, toArray } from './helper'
import { linters } from './linters'

// Run all the linters and collect the results.
const runLinters = async (
  type: 'check' | 'checkCode' | 'fix',
  filesOrCode: string | string[],
  opts: Options
): Promise<LinterResult[]> => {
  // If checking files or code, run the linters in parallel.
  // If fixing files, run in series to prevent file write conflicts.
  let results: LinterResult[] = []
  if (type === 'fix') {
    for (let name in linters) {
      let linterOpts: Options = opts[name] || {}
      linterOpts.language = opts.language
      results = await linters[name][type](toArray(filesOrCode), linterOpts)
    }
  } else {
    results = flatten(await Promise.all(Object.keys(linters).map(name => {
      let linterOpts: Options = opts[name] || {}
      linterOpts.language = opts.language
      if (type === 'check') {
        return linters[name].check(toArray(filesOrCode), linterOpts)
      } else {
        return linters[name].checkCode(filesOrCode as string, linterOpts)
      }
    })))
  }

  return results
}

// Run all fixer functions for code.
// Runs in series, passing the results from one linter to the next.
const runFixers = async (
  code: string,
  opts: Options
): Promise<string> => {
  for (let name in linters) {
    code = await linters[name].fixCode(code, opts[name] || {})
  }
  return code
}

export const check: FileLinterFunction = async (filePatterns: string[], opts: Options = {}) => {
  return runLinters('check', filePatterns, opts)
}

export const checkCode: CodeLinterFunction = async (code: string, opts: Options = {}) => {
  return runLinters('checkCode', code, opts)
}

export const fix: FileLinterFunction = async (filePatterns: string[], opts: Options = {}) => {
  return runLinters('fix', filePatterns, opts)
}

export const fixCode: CodeFixerFunction = async (code: string, opts: Options = {}) => {
  return runFixers(code, opts)
}

export const allLinters: Linter = {
  check,
  checkCode,
  fix,
  fixCode
}
