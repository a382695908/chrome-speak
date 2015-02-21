'use strict';

angular.module('popup').controller('PopupController', ['$scope', 'Speak',
	function($scope, Speak) {

		function getPlayer(){
			 var player = Speak.players.length > 0 ? Speak.players[0] : null;

			 console.info('Player', player);

			 if (player) 
			 	player.onremoved = function(){
			 		$scope.$safeApply(function(){
			 			$scope.player = getPlayer();
			 		});
			 	};

			 return player;
		}

		$scope.player = getPlayer();
	}
]);
