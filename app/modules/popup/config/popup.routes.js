'use strict';

//Setting up route
angular.module('popup').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/');

		// Popup state routing
		$stateProvider.
		state('popup', {
			url: '/',
			templateUrl: 'modules/popup/views/popup.view.html'
		});
	}
]);