'use strict';

const htmlhint = require('htmlhint').HTMLHint;
const { flatten, parseJson, readFiles, toArray } = require('../helper');

const config = parseJson(__dirname + '/../config/htmlhint.hjson');

exports.check = (filePattern, opts) => {
	return linter(filePattern, opts);
};

exports.fix = (filePattern, opts) => {
	// HTMLHint has no ability to fix, so just run the linter.
	return linter(filePattern, opts);
};

// Returns true if a file is an HTML file
//   (i.e., has a .html or .htm file extension).
function isHtmlFile(fileInfo) {
	return /\.htm(l?)$/.test(fileInfo.file);
}

// Lints a file object.
// Uses the "this" object passed with map() for the options.
function lintHtml(fileInfo) {
	let opts = this || config; // eslint-disable-line no-invalid-this
	return htmlhint.verify(fileInfo.contents, opts).map(result => {
		return {
			character: result.col,
			code: result.rule.id,
			description: result.message,
			evidence: result.evidence,
			file: fileInfo.file,
			line: result.line,
			plugin: 'htmlhint',
			type: result.type
		};
	});
}

function linter(filePattern, opts) {
	filePattern = toArray(filePattern);
	opts = Object.assign({}, config, opts);
	return readFiles(filePattern).then(fileInfo => {
		return flatten(fileInfo.filter(isHtmlFile).map(lintHtml, opts));
	});
}
