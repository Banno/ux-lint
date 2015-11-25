module.exports = {
	toBeLintError: function(util, customEqualityTesters) {
		return {
			compare: function(actual) {
				var expectedProps = [
					'character',
					'code',
					'description',
					'evidence',
					'file',
					'line',
					'type',
				];
				var result = { pass: true };
				for (var i = 0; i < expectedProps.length; i++) {
					if (typeof actual[expectedProps[i]] === 'undefined') {
						result.pass = false;
						result.message = 'Expected ' + JSON.stringify(actual) + ' to have a "' + expectedProps[i] + '" property';
						break;
					}
				}
				return result;
			}
		};
	}
};
