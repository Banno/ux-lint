import * as Linter from 'polymer-lint'
import * as allRules from 'polymer-lint/lib/rules'
import filterErrors = require('polymer-lint/lib/util/filterErrors')
import { capitalize, flatten, parseJson, readFiles, toArray } from '../helper'
import { PassThrough } from 'stream'

// Augment the PolymerLintError interface with a context property.
declare global {
  interface PolymerLintError {
    context: PolymerLintContext
  }
}

const config = parseJson(__dirname + '/../../config/polymer.hjson');

const customRules: PolymerLintRules = {
  'icon-titles': function iconTitles(context, parser, onError) {
    const iconRegExp = new RegExp(/jha-icon-[\w-]+/);
    parser.on('startTag', (name: string, attrs: SAXParserAttribute[], selfClosing: boolean, location: any) => {
      if (
        !name.match(iconRegExp) ||
        (name.match(iconRegExp) &&
          attrs.filter(attr => attr.name === 'title').length)
      ) {
        return;
      }
      onError({
        message: `Icon has no title attribute: ${name}`,
        location
      });
    });
  }
};

const check: FileLinterFunction = async (filePatterns, opts = {}) => {
  return await linterFunc('files', filePatterns, opts);
};

const checkCode: CodeLinterFunction = async (code, opts = {}) => {
  return await linterFunc('text', code, opts);
};

// polymer-lint doesn't have fix functionality.
const fix: FileLinterFunction = check;
const fixCode: CodeFixerFunction = async (code, opts) => {
  return code;
};

// Builds a rules object for polymer-lint,
//   based on the ux-lint rules definition.
function buildRules(rulesDefinition: PolymerLintRules) {
  let rules: PolymerLintRules = {};
  if (rulesDefinition) {
    // Only include rules that are specified and truthy.
    Object.keys(rulesDefinition).forEach(name => {
      if (rulesDefinition[name]) {
        rules[name] = allRules[name];
      }
    });
  } else {
    // If no rules are specified, use the entire set.
    rules = Object.assign({}, allRules, customRules);
  }
  return rules;
}

// Takes a polymer-lint error.
// Formats the error to match the ux-lint specs.
function formatResult(error: PolymerLintResult): LinterResult {
  return {
    character: error.location.col,
    code: error.rule,
    description: error.message,
    evidence: null,
    file: error.context.filename,
    line: error.location.line,
    plugin: 'polymer',
    type: 'error'
  };
}

// Returns true if a file is a Polymer component.
// It checks this by looking for a <dom-module> element in HTML files.
function isPolymerFile(fileInfo: FileInfo) {
  if (fileInfo.file === null) { return false }
  return /\.html$/.test(fileInfo.file) && /<dom-module/i.test(fileInfo.contents);
}

// Main function for linting.
const linterFunc = async (
  sourceType: 'files' | 'text',
  filesOrCode: string | string[],
  opts: Options
): Promise<LinterResult[]> => {
  opts = Object.assign({}, config, opts);

  let rules = buildRules(opts && opts.rules);
  let linter = new Linter(rules, opts);

  let getSource = async () => {
    if (sourceType === 'text') {
      let stream = new PassThrough();
      if (opts.language && opts.language !== 'html') {
        // Ignore non-HTML code.
        stream.end();
      } else {
        stream.end(filesOrCode);
      }
      return stream;
    }

    filesOrCode = toArray(filesOrCode);
    return readFiles(filesOrCode).then(fileInfo => {
      return fileInfo.filter(isPolymerFile).map(items => items.file);
    });
  };

  // Get the linter errors, filtering out those ignored by bplint directives.
  const getErrors = (result: PolymerLintResult) => {
    return filterErrors(result.errors, result.context.stack).map(error => {
      error.context = result.context;
      return error;
    });
  };

  const source = await getSource()
  const lintMethod = `lint${capitalize(sourceType === 'text' ? 'stream' : sourceType)}`;
  let results = await linter[lintMethod](source, {});
  if (sourceType === 'text') {
    // Wrap the response in an array for the next block.
    results = [results];
  }
  const errors = flatten(results.map(getErrors)).map(formatResult)
  return errors
}

const linter: Linter = {
  check,
  checkCode,
  fix,
  fixCode
}

export default linter
