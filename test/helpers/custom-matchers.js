'use strict';
module.exports = {
	toBeLintError: function(util, customEqualityTesters) {
		return {
			compare: function(actual) {
				const expectedProps = [
					'character',
					'code',
					'description',
					'evidence',
					'file',
					'line',
					'plugin',
					'type',
				];
				let actualProps = Object.keys(actual).sort();
				let result = {
					pass: util.equals(actualProps, expectedProps)
				};
				return result;
			}
		};
	}
};
