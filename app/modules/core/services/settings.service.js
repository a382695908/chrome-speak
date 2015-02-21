'use strict';

angular.module('core').factory('Settings', [
	function() {
		var bg = chrome.extension.getBackgroundPage();

		return bg.SettingsModule;
	}
]);