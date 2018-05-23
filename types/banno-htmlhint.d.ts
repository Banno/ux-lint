// banno-htmlhint has no built-in or DT types.
declare module 'banno-htmlhint' {
  import { FormatOptions, RuleSet } from 'htmlhint'

  export interface LintResult {
    evidence: string
    line: number
    col: number
    message: string
    rule: Rule
    type: 'error' | 'warning' | 'info'
  }

  interface Attribute {
    name: string
    value: string
    index: number
    raw: string
  }

  interface LintEvent {
    tagName: string
    line: number
    col: number
    attrs: Attribute[]
    raw: string
  }

  export type EventHandler = (event: LintEvent) => void

  export interface Parser {
    addListener: (event: string, handler: EventHandler) => void
  }

  export interface Reporter {
    error: (msg: string, line: number, col: number, rule: Rule, raw: string) => void
    warn: (msg: string, line: number, col: number, rule: Rule, raw: string) => void
  }

  export type RuleRunner = (parser: Parser, reporter: Reporter) => void

  export interface Rule {
    id: string;
    description: string;
    // link: string; // Not actually a thing?
    init: (parser: Parser, reporter: Reporter) => void
  }

  export namespace HTMLHint {
    function verify(fileContent: string, ruleSet?: RuleSet): LintResult[]
    function format(arrMessages: LintResult[], options?: FormatOptions): string[]

    // Missing from DT defs
    function addRule(rule: Rule): void
  }
}
