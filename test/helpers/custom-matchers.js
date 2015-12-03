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
				var actualProps = Object.keys(actual).sort();
				var result = {
					pass: util.equals(actualProps, expectedProps)
				};
				return result;
			}
		};
	}
};
