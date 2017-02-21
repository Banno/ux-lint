'use strict';
(function(context) {
	function foo() {
		return '42';
	}
	context.foo = foo();
})(window);
