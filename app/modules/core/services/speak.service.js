'use strict';

angular.module('core').factory('Speak', [
	function() {
		var bg = chrome.extension.getBackgroundPage();

		// Public API
		return bg.SpeakModule.Speak;
	}
]);