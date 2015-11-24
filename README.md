# Banno UX Linter

This project combines the following linting tools used by the Banno UX team into a single tool.

Javascript linting:

* [JSHint](http://jshint.com/)
* [JSCS](http://jscs.info/)

## Installation

```shell
npm install -g Banno/ux-lint
```

You can also install the module local to a project and then invoke it from the CLI or a Node file (see "API" below).

## Usage

```shell
ux-lint [--fix] [<folder>]
```

By default, ux-lint will lint the `src` folder in the current working directory. Pass file or folder names as arguments to lint them instead.

If a `--fix` argument is specified, ux-lint will attempt to automatically fix any linting errors that it finds.

## API

The ux-lint module can be included in your Javascript file and then invoked (for gulp or grunt tasks, for example).

```javascript
var linter = require('ux-lint');

linter.check('src', { /* optional config */ }, function(err, lintErrors) {
  // `err` is the Error object, if an error occurred
  // `lintErrors` is a collection of linting errors:
  // {
  //   jshint: [...]
  //   jscs: [...]
  // }
  // The specific data in the arrays is tool-dependent;
  // it may just be the lines from stdout.
});

linter.fix('src', { /* optional config */ }, function(err, response) {
  // `err` and `response` are in the same format as the check() callback
});

// A glob pattern can also be used:
linter.check('*.js', function() {});
```

The configuration object passed as the 2nd argument will override (not replace) the default configuration.

## Contributing

Please add tests and maintain the existing styling when adding and updating the code.

```
npm test   # run tests
```

### Linters

Each linter has a plugin in the `linters` folder. Plugins have the following signature:

```javascript
// Both methods return a promise that resolves to an array.
exports.check = function(filePattern, opts) { /* ... */ };
exports.fix   = function(filePattern, opts) { /* ... */ };
```

Look at other plugins for the common patterns and modules to use.

Plugins are automatically loaded by the ux-lint tool.

## License

Copyright 2015 [Jack Henry & Associates Inc](https://www.jackhenry.com/).

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
