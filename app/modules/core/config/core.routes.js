'use strict';

//Setting up route
angular.module('core').config(['$stateProvider',
	function($stateProvider) {
		// Core state routing
		$stateProvider.
		state('params', {
			url: '/',
			templateUrl: 'modules/core/views/params.view.html'
		});
	}
]);