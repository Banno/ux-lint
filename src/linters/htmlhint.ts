import { HTMLHint as htmlhint, Rule, RuleRunner } from 'banno-htmlhint'
import { flatten, parseJson, readFiles, toArray } from '../helper'
import { Options } from '../options'

const config = parseJson(__dirname + '/../../config/htmlhint.hjson')

// Implements the "banno/doc-lang" rule.
const configureDocLang: RuleRunner = (parser, reporter) => {
  parser.addListener('tagstart', function (this: Rule, event) {
    if (event.tagName.toLowerCase() === 'html') {
      let foundLang = false
      let col = event.col + event.tagName.length + 1
      for (let attr of event.attrs) {
        if (attr.name.toLowerCase() === 'lang') {
          foundLang = true
          if (attr.value === '') {
            reporter.error(
              '"lang" attribute must not be empty.',
              event.line,
              col + attr.index,
              this,
              event.raw
            )
          }
        }
      }
      if (!foundLang) {
        reporter.error(
          '<html> tag must have a "lang" attribute',
          event.line,
          col,
          this,
          event.raw
        )
      }
    }
  })
}

// Implements the "banno/link-href" rule.
const configureLinkHref: RuleRunner = (parser, reporter) => {
  parser.addListener('tagstart', function (this: Rule, event) {
    if (event.tagName.toLowerCase() === 'a') {
      let foundHref = false
      let col = event.col + event.tagName.length + 1
      for (let attr of event.attrs) {
        if (attr.name.toLowerCase() === 'href') {
          foundHref = true
          if (attr.value === '' && attr.raw.toLowerCase().includes('href=')) {
            reporter.error(
              'Link target must not be empty.',
              event.line,
              col + attr.index,
              this,
              event.raw
            )
          }
          if (attr.value === '#') {
            reporter.error(
              'Link target must not be "#".',
              event.line,
              col + attr.index,
              this,
              event.raw
            )
          }
          if (attr.value.includes('javascript:void(0)')) {
            reporter.error(
              'Link target must not use "javascript:void(0)".',
              event.line,
              col + attr.index,
              this,
              event.raw
            )
          }
        }
      }
      if (!foundHref) {
        reporter.error(
          'Link must have an "href" attribute',
          event.line,
          col,
          this,
          event.raw
        )
      }
    }
  })
}

// Implements the "banno/meta-charset-utf8" rule.
const configureMetaCharset: RuleRunner = (parser, reporter) => {
  parser.addListener('tagstart', function (this: Rule, event) {
    if (event.tagName.toLowerCase() === 'meta') {
      let col = event.col + event.tagName.length + 1
      for (let attr of event.attrs) {
        if (attr.name.toLowerCase() === 'charset') {
          if (attr.value.toLowerCase() !== 'utf-8') {
            reporter.error(
              '<meta> charset must be UTF-8.',
              event.line,
              col + attr.index,
              this,
              event.raw
            )
          }
        }
      }
    }
  })
  let startedHead = false
  parser.addListener('tagstart', function (this: Rule, event) {
    if (event.tagName.toLowerCase() === 'head') {
      startedHead = true
    } else if (startedHead) {
      startedHead = false
      if (
        event.tagName.toLowerCase() !== 'meta' ||
        !event.attrs.map(attr => attr.name.toLowerCase()).includes('charset')
      ) {
        reporter.warn(
          '<meta charset="utf-8"> should be the first tag in <head>.',
          event.line,
          event.col,
          this,
          event.raw
        )
      }
    }
  })
}

// Add our custom rules.
htmlhint.addRule({
  id: 'banno/doc-lang',
  description: '<html> tags must have a "lang" attribute.',
  init: configureDocLang
})
htmlhint.addRule({
  id: 'banno/link-href',
  description: 'Links must have an href and it must be valid.',
  init: configureLinkHref
})
htmlhint.addRule({
  id: 'banno/meta-charset-utf8',
  description: '<meta> charset must be UTF-8.',
  init: configureMetaCharset
})

// Returns true if a file is an HTML file
//   (i.e., has a .html or .htm file extension).
const isHtmlFile = (fileInfo: FileInfo): boolean => {
  return fileInfo.file !== null && /\.htm(l?)$/.test(fileInfo.file)
}

// Lints a file object.
const lintHtml = (fileInfo: FileInfo, opts: Options): LinterResult[] => {
  return htmlhint.verify(fileInfo.contents, opts).filter(result => {
    return result.type === 'error' || result.type === 'warning'
  }).map(result => {
    const formatted: LinterResult = {
      character: result.col,
      code: result.rule.id,
      description: result.message,
      evidence: result.evidence,
      file: fileInfo.file,
      line: result.line,
      plugin: 'htmlhint',
      type: result.type as 'error' | 'warning'
    }
    return formatted
  })
}

const linterFunc: FileLinterFunction = (filePattern, opts) => {
  const filePatterns = toArray(filePattern)
  opts = Object.assign({}, config, opts)
  return readFiles(filePatterns).then(fileInfo => {
    return flatten(fileInfo.filter(isHtmlFile).map(function (this: Options, item) {
      return lintHtml(item, this || /* istanbul ignore next */ config)
    }, opts))
  })
}

const check: FileLinterFunction = async (filePattern, opts) => {
  return linterFunc(filePattern, opts)
}

const checkCode: CodeLinterFunction = async (code, opts = {}) => {
  opts = Object.assign<LinterOptions, LinterOptions, LinterOptions>({}, config, opts)
  if (opts.language && opts.language !== 'html') {
    // Ignore non-HTML code.
    return Promise.resolve([])
  }
  return lintHtml({
    contents: code,
    file: null
  }, opts)
}

// HTMLHint has no ability to fix.
const fix: FileLinterFunction = check
const fixCode: CodeFixerFunction = async (code, opts) => {
  return code
}

const linter: Linter = {
  check,
  checkCode,
  fix,
  fixCode
}

export default linter
