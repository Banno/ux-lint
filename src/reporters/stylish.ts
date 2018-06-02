//
// Stylish reporter, inspired by jshint-stylish
//   (https://github.com/sindresorhus/jshint-stylish).
//
/* eslint no-console: "off" */

import chalk from 'chalk'
import * as logSymbols from 'log-symbols'
import * as pluralize from 'pluralize'
import * as stringLength from 'string-length'
import * as table from 'text-table'
import { sort as sortFunc } from '../helper'
import { Options } from '../options'

const reporter = (results: LinterResult[], opts: Options = {}): void => {
  let output = ''
  let headers: string[] = []
  let prevfile: string
  let errorCount = 0
  let warningCount = 0

  results.sort(sortFunc)

  output += table(results.map((err, i) => {
    let isError = err.type && err.type === 'error'

    let line = [
      '',
      '',
      chalk.gray(err.plugin),
      chalk.gray(err.code),
      chalk.gray(`line ${err.line}`),
      chalk.gray(`col ${err.character}`),
      isError ? chalk.red(err.description) : chalk.blue(err.description)
    ]

    if (err.file !== prevfile) {
      headers[i] = err.file || ''
    }

    if (opts.verbose) {
      line.push(chalk.gray(`(${err.code})`))
    }

    if (isError) {
      errorCount++
    } else {
      warningCount++
    }

    prevfile = err.file || ''

    return line
  }), {
    stringLength: stringLength
  }).split('\n').map((line: string, i: number) => {
    return headers[i] ? `\n  ${chalk.underline(headers[i])}\n${line}` : line
  }).join('\n') + '\n\n'

  if (errorCount + warningCount > 0) {
    if (errorCount > 0) {
      output += `${logSymbols.error}  ${errorCount} ${pluralize('error', errorCount)}\n`
    }
    if (warningCount > 0) {
      output += `${logSymbols.warning}  ${warningCount} ${pluralize('warning', warningCount)}\n`
    }
  } else {
    output += `${logSymbols.success} No problems\n`
  }

  console.log(output)
}

export default reporter
