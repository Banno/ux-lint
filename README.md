# Banno UX Linter

This project combines the following linting tools used by the Banno UX team into a single tool.

* [ESLint](http://eslint.org/) for JS files
* [HTMLHint](https://github.com/yaniswang/HTMLHint) for HTML files, with [additional custom rules](docs/htmlhint.md)
* [polymer-lint](https://github.com/Banno/polymer-lint) for Polymer component (HTML) files, with [additional custom rules](docs/polymer.md)

## Installation

[Node.js](https://nodejs.org/) 8.0.0 or higher is required.

```shell
npm install -g ux-lint
```

You can also install the module local to a project and then invoke it from the CLI or a Node file (see "API" below).

## Usage

```shell
ux-lint [--fix] [--extend <optionsFile>] [<folder>]
```

By default, ux-lint will lint any JS files in the `src` folder (including subfolders) and the current working directory. Pass file or folder names as arguments to lint them instead. Non-files (e.g., folders, devices, sockets, etc.) are automatically ignored.

If a `--fix` argument is specified, ux-lint will attempt to automatically fix any linting errors that it finds.

If `--extend` arguments are specified, ux-lint will parse the following JSON files for configuration overrides. The overrides should be indexed by plugin name (e.g., `eslint`).

The exit code is equal to the number of errors found by ux-lint (`0` if no errors).

## API

The ux-lint module can be included in your Javascript file and then invoked programmatically. All methods are Promise-based.

```javascript
var linter = require('ux-lint');

linter.check(['src'], { /* optional config, keyed by plugin name */ }).then(lintErrors => {
  // `lintErrors` is an array of linting errors
});

linter.fix(['src'], { /* optional config */ }.then(lintErrors => {
  // same format as the check() callback
});

// A glob pattern can also be used:
linter.check(['*.js']).then(/* ... */);
```

The first argument can be an array of files or file patterns.

The configuration object passed as the 2nd argument will override (not replace) the default configuration.

You can also check/fix code directly:

```javascript
linter.checkCode('// code here', { /* optional config, keyed by plugin name */ }.then(lintErrors => {
  // `lintErrors` is an array of linting errors
});

linter.fixCode('// code here', { /* optional config */ }.then(fixedCode => {
  // `fixedCode` is the source code with the fixes
});
```

A `language` option can be passed in the options to specify the format of the code (`html` or `javascript`), so that the appropriate linters are run.

## Contributing

Want to propose a change to our style (and therefore linting) conventions? Want to add another linting tool? Pull requests and suggestions are welcome.

This project is written in [TypeScript](http://www.typescriptlang.org/) and compiled to the target runtime. See the [`types/linters.d.ts` file](types/linters.d.ts) for type info.

Please add tests and maintain the existing styling when adding and updating the code.

```
yarn lint  # run linting
yarn test  # run tests
```

### Linters

Each linter has a plugin in the `src/linters` folder. Plugins have the following signature:

```javascript
exports.check: FileLinterFunction = async (filePatterns, opts = {}) => {}
exports.checkCode: CodeLinterFunction = async (code, opts = {}) => {}
exports.fix: FileLinterFunction = async (filePatterns, opts = {}) => {}
exports.fixCode: CodeFixerFunction = async (code, opts = {}) => {}
```

`check()`, `checkCode()`, and `fix()` return an array of `LinterResult` objects, for example:

```javascript
[{
  plugin: 'eslint', // or 'jscs', etc
  type: 'error', // or 'warning'
  code: 'W117', // plugin's internal ID for the error
  evidence: '\t\t\tconsole.log(error);', // copy of the offending code
  line: 13, // line number of the offending code
  character: 9, // column number of the offending code
  description: '\'console\' is not defined.', // message about the error
  file: '/Users/jdoe/bad-javascript.js' // filename (check() and fix() only)
}]
```

`fix()` returns the modified string of code.

Add the new linter to `src/linters.ts` to include it the linter. Look at the other plugins for the common patterns and modules to use.

### Reporters

Each reporter has a module in the `src/reporters` folder. Modules should have a default export which have a function signature of `(results: LinterResult[], opts: Options = {}) => void`.

Currently there is not an option to change the formatted results from the default "stylish" reporter -- see https://github.com/Banno/ux-lint/issues/54.

## License

Copyright 2015-2018 [Jack Henry & Associates Inc](https://www.jackhenry.com/).

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
