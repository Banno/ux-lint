'use strict';

const { CLIEngine } = require('eslint');
const extend = require('extend');
const { capitalize, flatten, parseJson, readFiles, toArray } = require('../helper');

const config = parseJson(__dirname + '/../config/eslint.hjson');

exports.check = (filePattern, opts) => {
	return linter('lint', 'files', filePattern, opts);
};

exports.checkCode = (code, opts) => {
	return linter('lint', 'text', code, opts);
};

// Note that eslint's fix excludes the fixed items from the results.
exports.fix = (filePattern, opts) => {
	return linter('fix', 'files', filePattern, opts);
};

exports.fixCode = (code, opts) => {
	return linter('fix', 'text', code, opts);
};

// Takes an eslint result from executeOnFiles().
// Returns the error messages, and includes the
//   file path and code from the "result" object.
function extractMessages(result) {
	return result.messages.map((message) => {
		return Object.assign({}, message, {
			filePath: result.filePath,
			output: result.output
		});
	});
}

// Returns true if a file is a Javascript file
//   (i.e., has a .js file extension).
function isJsFile(fileInfo) {
	return /\.js$/.test(fileInfo.file);
}

// Main function for linting/fixing.
//   `type` is "lint" or "fix"
//   `sourceType` is "files" or "text"
function linter(type, sourceType, filesOrCode, opts) {
	opts = extend(true, {}, config, opts);

	let cli = new CLIEngine({
		baseConfig: opts,
		dotfiles: true,
		fix: type === 'fix',
		useEslintrc: false
	});

	let getSource = () => {
		if (sourceType === 'text') {
			if (opts.language && opts.language !== 'javascript') {
				return Promise.resolve('');
			}
			return Promise.resolve(filesOrCode);
		}

		filesOrCode = toArray(filesOrCode);
		return readFiles(filesOrCode).then(fileInfo => {
			return fileInfo.filter(isJsFile).map(items => items.file);
		});
	};

	return getSource().then(source => {
		let executeMethod = `executeOn${capitalize(sourceType)}`;
		let report = cli[executeMethod](source);
		let results = flatten(report.results.map(extractMessages)).map((result) => {
			return {
				character: result.column,
				code: result.ruleId,
				description: result.message,
				evidence: result.output,
				file: result.filePath,
				line: result.line,
				plugin: 'eslint',
				type: result.severity > 1 || result.fatal ? 'error' : 'warning'
			};
		});

		if (type === 'fix') {
			if (sourceType === 'files') {
				// Persist fixes to the files.
				CLIEngine.outputFixes(report);
			} else if (sourceType === 'text') {
				// Return the fixed code (or the original code,
				//   if there are no fixes).
				return report.results[0].hasOwnProperty('output') ?
					report.results[0].output :
					source;
			}
		}
		return results;
	});
}
