// polymer-lint has no built-in or DT types.
declare module 'polymer-lint';
declare module 'polymer-lint/lib/rules'

declare module 'polymer-lint/lib/util/filterErrors' {
  function filterErrors(errors: PolymerLintError[], stack: string): PolymerLintError[]
  export = filterErrors
}

interface PolymerLintContext {
  filename: string
  stack: string
}

interface PolymerLintError {
  // TODO
}

interface PolymerLintLocation {
  line: number
  col: number
}

type PolymerLintRule = (context: PolymerLintContext, parser: SAXParser, onError: Function) => void

interface PolymerLintRules {
  [name: string]: PolymerLintRule
}

interface PolymerLintResult {
  errors: PolymerLintError[]
  rule: string
  location: PolymerLintLocation
  message: string
  context: PolymerLintContext
}

interface SAXParser {
  on: (event: string, callback: Function) => void
}

interface SAXParserAttribute {
  name: string
  namespace?: string
  prefix?: string
  value: string
}
