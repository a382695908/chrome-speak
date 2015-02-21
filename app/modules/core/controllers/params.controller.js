'use strict';

angular.module('core').controller('ParamsController', ['$scope', 'Settings',
	function($scope, Settings) {
		$scope.voiceSelector = Settings.get('voiceSelector');
		$scope.save = function save(){
			console.info('save', $scope.voiceSelector);
			if ($scope.voiceSelector)
				Settings.set('voiceSelector', $scope.voiceSelector);
		};
	}
]);