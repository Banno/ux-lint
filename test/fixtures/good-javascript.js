(function(context) {
	'use strict';
	function foo() {
		return '42';
	}
	context.foo = foo();
})(this);
