'use strict';
(() => {
	onboarding.controller('createUserController', ['$scope', '$stateParams', '$state',
		'usersService', function($scope, $stateParams, $state, usersService) {
			for (let param of $stateParams) {
				param.foo = 'foo';
			}

			$scope.createUser = function(user) {
				usersService.createUser(user).then((result) => {
					$scope.userCreated = true;
					$state.go('userProfile', { id: result._id });
				}, () => {
					$scope.userCreated = false;
				});

			};
		}]);
})();
