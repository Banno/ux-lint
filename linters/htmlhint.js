'use strict';

const htmlhint = require('htmlhint').HTMLHint;
const { flatten, parseJson, readFiles, toArray } = require('../helper');

const config = parseJson(__dirname + '/../config/htmlhint.hjson');

// Add our custom rules.
htmlhint.addRule({
	id: 'banno/doc-lang',
	description: '<html> tags must have a "lang" attribute.',
	init: configureDocLang
});
htmlhint.addRule({
	id: 'banno/link-href',
	description: 'Links must have an href and it must be valid.',
	init: configureLinkHref
});
htmlhint.addRule({
	id: 'banno/meta-charset-utf8',
	description: '<meta> charset must be UTF-8.',
	init: configureMetaCharset
});

exports.check = (filePattern, opts) => {
	return linter(filePattern, opts);
};

exports.checkCode = (code, opts) => {
	opts = Object.assign({}, config, opts);
	return Promise.resolve(
		lintHtml({
			contents: code,
			file: null
		}, opts)
	);
};

// HTMLHint has no ability to fix.
exports.fix = exports.check;
exports.fixCode = (code, opts) => {
	return Promise.resolve(code);
};

// Implements the "banno/doc-lang" rule.
function configureDocLang(parser, reporter) {
	parser.addListener('tagstart', event => {
		if (event.tagName.toLowerCase() === 'html') {
			let foundLang = false;
			let col = event.col + event.tagName.length + 1;
			for (let attr of event.attrs) {
				if (attr.name.toLowerCase() === 'lang') {
					foundLang = true;
					if (attr.value === '') {
						reporter.error(
							'"lang" attribute must not be empty.',
							event.line,
							col + attr.index,
							this, // eslint-disable-line no-invalid-this
							event.raw
						);
					}
				}
			}
			if (!foundLang) {
				reporter.error(
					'<html> tag must have a "lang" attribute',
					event.line,
					col,
					this, // eslint-disable-line no-invalid-this
					event.raw
				);
			}
		}
	});
}

// Implements the "banno/link-href" rule.
function configureLinkHref(parser, reporter) {
	parser.addListener('tagstart', event => {
		if (event.tagName.toLowerCase() === 'a') {
			let foundHref = false;
			let col = event.col + event.tagName.length + 1;
			for (let attr of event.attrs) {
				if (attr.name.toLowerCase() === 'href') {
					foundHref = true;
					if (attr.value === '' && attr.raw.toLowerCase().includes('href=')) {
						reporter.error(
							'Link target must not be empty.',
							event.line,
							col + attr.index,
							this, // eslint-disable-line no-invalid-this
							event.raw
						);
					}
					if (attr.value === '#') {
						reporter.error(
							'Link target must not be "#".',
							event.line,
							col + attr.index,
							this, // eslint-disable-line no-invalid-this
							event.raw
						);
					}
					if (attr.value.includes('javascript:void(0)')) {
						reporter.error(
							'Link target must not use "javascript:void(0)".',
							event.line,
							col + attr.index,
							this, // eslint-disable-line no-invalid-this
							event.raw
						);
					}
				}
			}
			if (!foundHref) {
				reporter.error(
					'Link must have an "href" attribute',
					event.line,
					col,
					this, // eslint-disable-line no-invalid-this
					event.raw
				);
			}
		}
	});
}

// Implements the "banno/meta-charset-utf8" rule.
function configureMetaCharset(parser, reporter) {
	parser.addListener('tagstart', event => {
		if (event.tagName.toLowerCase() === 'meta') {
			let col = event.col + event.tagName.length + 1;
			for (let attr of event.attrs) {
				if (attr.name.toLowerCase() === 'charset') {
					if (attr.value.toLowerCase() !== 'utf-8') {
						reporter.error(
							'<meta> charset must be UTF-8.',
							event.line,
							col + attr.index,
							this, // eslint-disable-line no-invalid-this
							event.raw
						);
					}
				}
			}
		}
	});
	let startedHead = false;
	parser.addListener('tagstart', event => {
		if (event.tagName.toLowerCase() === 'head') {
			startedHead = true;
		} else if (startedHead) {
			startedHead = false;
			if (
				event.tagName.toLowerCase() !== 'meta' ||
				!event.attrs.map(attr => attr.name.toLowerCase()).includes('charset')
			) {
				reporter.warn(
					'<meta charset="utf-8"> should be the first tag in <head>.',
					event.line,
					event.col,
					this, // eslint-disable-line no-invalid-this
					event.raw
				);
			}
		}
	});
}

// Returns true if a file is an HTML file
//   (i.e., has a .html or .htm file extension).
function isHtmlFile(fileInfo) {
	return /\.htm(l?)$/.test(fileInfo.file);
}

// Lints a file object.
function lintHtml(fileInfo, opts) {
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
		return flatten(fileInfo.filter(isHtmlFile).map(function(item) {
			return lintHtml(item, this || config);
		}, opts));
	});
}