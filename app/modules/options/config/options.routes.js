'use strict';

//Setting up route
angular.module('options').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/');
		// Options state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/options/views/home.view.html'
		});
	}
]);