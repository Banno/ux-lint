'use strict';

const Linter = require('polymer-lint');
const filterErrors = require('polymer-lint/lib/util/filterErrors');
const { capitalize, flatten, parseJson, readFiles, toArray } = require('../helper');
const { PassThrough } = require('stream');

const allRules = require('polymer-lint/lib/rules');
const config = parseJson(__dirname + '/../config/polymer.hjson');

const customRules = {
	'icon-titles': function iconTitles(context, parser, onError) {
		  const iconRegExp = new RegExp(/jha-icon-[\w-]+/);
		  parser.on('startTag', (name, attrs, selfClosing, location) => {
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
}

exports.check = (filePattern, opts) => {
	return linter('files', filePattern, opts);
};

exports.checkCode = (code, opts) => {
	return linter('text', code, opts);
};

// polymer-lint doesn't have fix functionality.
exports.fix = exports.check;
exports.fixCode = (code, opts) => {
	return Promise.resolve(code);
};

// Builds a rules object for polymer-lint,
//   based on the ux-lint rules definition.
function buildRules(rulesDefinition) {
	let rules = {};
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
function formatResult(error) {
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
function isPolymerFile(fileInfo) {
	return /\.html$/.test(fileInfo.file) && /<dom-module/i.test(fileInfo.contents);
}

// Main function for linting.
//   `sourceType` is "files" or "text"
function linter(sourceType, filesOrCode, opts) {
	opts = Object.assign({}, config, opts);

	let rules = buildRules(opts && opts.rules);
	let linter = new Linter(rules, opts);

	let getSource = () => {
		if (sourceType === 'text') {
			let stream = new PassThrough();
			if (opts.language && opts.language !== 'html') {
				// Ignore non-HTML code.
				stream.end();
			} else {
				stream.end(filesOrCode);
			}
			return Promise.resolve(stream);
		}

		filesOrCode = toArray(filesOrCode);
		return readFiles(filesOrCode).then(fileInfo => {
			return fileInfo.filter(isPolymerFile).map(items => items.file);
		});
	};

	return getSource().then(source => {
		let lintMethod = `lint${capitalize(sourceType === 'text' ? 'stream' : sourceType)}`;
		return linter[lintMethod](source, {});
	}).then(results => {
		if (sourceType === 'text') {
			// Wrap the response in an array for the next block.
			return [results];
		}
		return results;
	}).then(results => {
		// Get the linter errors, filtering out those ignored by bplint directives.
		const getErrors = result => {
			return filterErrors(result.errors, result.context.stack).map(error => {
				error.context = result.context;
				return error;
			});
		};
		return flatten(results.map(getErrors));
	}).then(errors => {
		// Format the errors to match the ux-lint specs.
		return errors.map(formatResult);
	});
}
