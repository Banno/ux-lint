#!/usr/bin/env node

const USAGE_STATEMENT = `
ux-lint [options] [file.js ...] [dir ...]

Options:
  --extend [path]         Use custom linter configuration file
  --fix                   Automatically fix linting errors
`

import chalk from 'chalk'
import * as parseArgs from 'minimist'
import { allLinters } from './'
import { parseJson } from './helper'
import reporter from './reporters/stylish'

const firstArgIndex = 2
const args = parseArgs(process.argv.slice(firstArgIndex))

if (args.help) {
  console.log(USAGE_STATEMENT)
  /* istanbul ignore if */
  if (require.main === module) {
    process.exit()
  }
}

const type = args.fix ? 'fix' : 'check'
let files = (!args._ || args._.length === 0) ? ['src/**/*.js', '*.js'] : args._

let optFiles: string[] = typeof args.extend === 'undefined' ? [] : Array.from(args.extend)

let opts = optFiles.reduce((prevVal, currentVal) => {
  return Object.assign({}, prevVal, parseJson(currentVal))
}, {})

const run = () => {
  return allLinters[type](files, opts).then(results => {
    reporter(results, args)
    process.exitCode = results.length
  }).catch((err: Error) => {
    console.log(chalk.red('Error: ') + err.message + '\n')
    console.log(err.stack)
  })
}

/* istanbul ignore if */
if (require.main === module) {
  run() // tslint:disable-line no-floating-promises
}

module.exports = { // for testing
  run
}
