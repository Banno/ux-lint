interface FileInfo {
  file: string | null
  contents: string
}

interface LinterResult {
  plugin: string
  type: 'error' | 'warning'
  code: string
  evidence: string | null
  line: number
  character: number
  description: string
  file: string | null
}

interface LinterOptions {
  [key: string]: string
}

type FileLinterFunction = (filePatterns: string[], opts?: LinterOptions) => Promise<LinterResult[]>
type CodeLinterFunction = (code: string, opts?: LinterOptions) => Promise<LinterResult[]>
type CodeFixerFunction = (code: string, opts?: LinterOptions) => Promise<string>

interface Linter {
  [method: string]: FileLinterFunction | CodeLinterFunction | CodeFixerFunction
  check: FileLinterFunction
  checkCode: CodeLinterFunction
  fix: FileLinterFunction
  fixCode: CodeFixerFunction
}

interface LinterList {
  [name: string]: Linter
}
