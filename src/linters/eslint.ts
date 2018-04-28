import { CLIEngine } from 'eslint'
import * as extend from 'extend'
import { extname } from 'path'
import { capitalize, flatten, parseJson, readFiles, toArray } from '../helper'

const config = parseJson(__dirname + '/../../config/eslint.hjson');

const allowedExtensions = [
  '.htm', '.html', // include HTML for <script> linting
  '.js',
];
const allowedLanguages = [
  'html', // include HTML for <script> linting
  'javascript'
];

// Takes an eslint result from executeOnFiles().
// Returns the error messages, and includes the
//   file path and code from the "result" object.
function extractMessages(result: CLIEngine.LintResult) {
  return result.messages.map((message) => {
    return Object.assign({}, message, {
      filePath: result.filePath,
      output: result.output
    });
  });
}

// Main function for linting/fixing.
const linterFunc = async (
  type: 'lint' | 'fix',
  sourceType: 'files' | 'text',
  filesOrCode: string | string[],
  opts: Options
) => {
  opts = extend(true, {}, config, opts);

  let cli = new CLIEngine({
    baseConfig: opts,
    dotfiles: true,
    extensions: allowedExtensions,
    fix: type === 'fix',
    useEslintrc: false
  });

  let getSource = async (): Promise<string[] | string> => {
    if (sourceType === 'text') {
      if (opts.language && !allowedLanguages.includes(opts.language)) {
        return Promise.resolve('');
      }
      return Promise.resolve(filesOrCode);
    }

    filesOrCode = toArray(filesOrCode);
    let files = await readFiles(filesOrCode)
    return files.filter(
      item => allowedExtensions.includes(extname(item.file!))
    ).map(items => items.file!)
  };

  const source = await getSource()
  let args = toArray(source);
  let report = sourceType === 'text' ?
    cli.executeOnText(
      source as string,
      // A filename is required for eslint-plugin-html to parse HTML files.
      opts.language === 'html' ? '[placeholder].html' : undefined
    ) :
    cli.executeOnFiles(args)
  let results = flatten(report.results.map(extractMessages)).map((result) => {
    const formatted: LinterResult = {
      character: result.column,
      code: result.ruleId,
      description: result.message,
      evidence: result.output,
      file: result.filePath,
      line: result.line,
      plugin: 'eslint',
      type: result.severity > 1 || result.fatal ? 'error' : 'warning'
    };
    return formatted
  });

  if (type === 'fix') {
    if (sourceType === 'files') {
      // Persist fixes to the files.
      CLIEngine.outputFixes(report);
    } else if (sourceType === 'text') {
      // Return the fixed code (or the original code,
      //   if there are no fixes).
      return report.results[0].hasOwnProperty('output') ?
        report.results[0].output || '' :
        source;
    }
  }
  return results;
}

const check: FileLinterFunction = async (filePatterns, opts = {}) => {
  return await linterFunc('lint', 'files', filePatterns, opts) as LinterResult[];
};

const checkCode: CodeLinterFunction = async (code, opts = {}) => {
  return await linterFunc('lint', 'text', code, opts) as LinterResult[];
};

// Note that eslint's fix excludes the fixed items from the results.
const fix: FileLinterFunction = async (filePatterns, opts = {}) => {
  return await linterFunc('fix', 'files', filePatterns, opts) as LinterResult[];
};

const fixCode: CodeFixerFunction = async (code, opts = {}) => {
  return await linterFunc('fix', 'text', code, opts) as string;
};

const linter: Linter = {
  check,
  checkCode,
  fix,
  fixCode
}

export default linter
