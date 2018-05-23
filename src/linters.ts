import eslint from './linters/eslint'
import htmlhint from './linters/htmlhint'
import polymer from './linters/polymer'

export const linters: LinterList = {
  eslint,
  htmlhint,
  polymer
}
