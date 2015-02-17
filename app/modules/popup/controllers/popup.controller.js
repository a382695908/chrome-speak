'use strict';

angular.module('popup').controller('PopupController', ['$scope', 'Speak',
	function($scope, Speak) {
		var currentPlayer = $scope.currentPlayer = Speak.players[0];

		if (currentPlayer){
			currentPlayer.onstopped = currentPlayer.onended = function changeState(){
				currentPlayer.remove();
				$scope.apply(function(){
					$scope.currentPlayer = null;
				});
			};
		}
	}
]);
