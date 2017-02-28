'use strict';

const extend = require('extend');
const filterErrors = require('polymer-lint/lib/util/filterErrors');
const flatten = require('../helper').flatten;
const readFiles = require('../helper').readFiles;
const Linter = require('polymer-lint');
const parseJson = require('../helper').parseJson;
const toArray = require('../helper').toArray;

const allRules = require('polymer-lint/lib/rules');
const config = parseJson(__dirname + '/../config/polymer.hjson');

exports.check = (filePattern, opts) => {
	filePattern = toArray(filePattern);
	opts = extend({}, config, opts);
	let rules = buildRules(opts && opts.rules);
	let linter = new Linter(rules, opts);
	return readFiles(filePattern).then(fileInfo => {
		// Run the linter against Polymer files.
		let files = fileInfo.filter(isPolymerFile).map(items => items.file);
		return linter.lintFiles(files);
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
};

// polymer-lint doesn't have fix functionality.
exports.fix = exports.check;

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
		rules = extend({}, allRules);
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
