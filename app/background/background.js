'use strict';

var lS = window.lS = (function() {

	var localStorage = window.localStorage;

	function set(name, value) {
		localStorage[name] = JSON.stringify(value);
	}

	function get(name) {
		var unparsedValue = localStorage[name],
			parsedValue;

		try {
			parsedValue = JSON.parse(unparsedValue);
		} catch (e) {
			parsedValue = unparsedValue;
		}

		return parsedValue;
	}

	return function(name, value) {
		if (arguments.length === 2)
			return set(name, value);
		else return get(name);
	};

})();

var SpeakModule = (function(context, $, _, async) {

	var PARALLEL_DOWNLOAD_LIMIT = 5;

	var getMP3 = (function() {
		function loadInIframe(url, callback) {
			if (typeof url !== 'string') {
				throw new Error('Invalid loadInIframe url');
			}

			var $iframe = $('<iframe>', {
				src: url,
			});

			if (typeof callback === 'function') {
				$iframe.on('load', function() {
					callback.call($(this));

				});
			}

			$('body').append($iframe);

			return $iframe;
		}

		var $iframe,
			iframeLoaded = false;

		function sendSignal(text, voiceSelector, callback) {
			chrome.runtime.sendMessage({
				text: text,
				voiceSelector: voiceSelector
			}, function(res) {
				if (typeof callback === 'function') {
					callback.call($iframe, res.err, res.url);
				}
			});
		}

		function _getMP3() {
			var argumentsMp3 = arguments;

			if (!$iframe) {
				$iframe = loadInIframe('http://www.ivona.com/');
			}

			if (!iframeLoaded) {
				$iframe.on('load', function() {
					iframeLoaded = true;
					sendSignal.apply(this, argumentsMp3);
				});
			} else {
				sendSignal.apply(this, argumentsMp3); /* jshint ignore:line */
			}
		}

		return _getMP3;
	})();

	var Speak = (function(AudioPlayer) {


		

		var truncate = (function() {
			function splitPreserve(text, sepChar) {
				return text.split(sepChar).join(sepChar + '/~¬~/').split('/~¬~/');
			}

			function append(resArr, text, maxChars) {
				if (resArr.length && (_.last(resArr).length + text.length) < maxChars) {
					resArr[resArr.length - 1] += text;
				} else {
					resArr.push(text);
				}
			}

			function _truncate(text, maxChars, level, response) {
				level = (typeof level === 'number' && level >= 0 && level <= 3) ? level : 0;
				response = _.isArray(response) ? response : [];

				var separator = ['.', ',', ' ', ''][level];
				var units = splitPreserve(text, separator);

				_.each(units, function(unit) {
					if (unit.length <= maxChars - 2) {
						append(response, unit, maxChars);
					} else {
						truncate.call(this, unit, maxChars, level + 1, response);
					}
				});

				return response;
			}

			return _truncate;
		})();


		function Class(args) {
			if (typeof args.text !== 'string' || typeof args.voiceSelector !== 'number') {
				throw new Error('Invalid Speak params. Usage: new Speak({text: <string>, voiceSelector : <number>, ... }');
			}

			var argsCopy = _.clone(args);
			delete argsCopy.autoplay;

			AudioPlayer.call(this, argsCopy);

			var self = this,
				set = this.set,
				ongetvoices = null;

			//attributes
			var text = this.text = args.text,
				voiceSelector = this.voiceSelector = args.voiceSelector;

			//events
			this.ongetvoices = args.ongetvoices;
			this.onerror = args.onerror;

			//methods
			this.load = function() {
				if (self.urls) {
					return;
				}

				var units = truncate(text, 250);
				async.mapLimit(units, PARALLEL_DOWNLOAD_LIMIT, function(unit, callback) {
					getMP3(unit, voiceSelector, callback);
				}, function(err, urls) {
					if (err) {
						if (typeof self.onerror === 'function') {
							self.onerror.call(this, err);
						}
					} else {
						set('urls',urls);

						if (typeof self.ongetvoices === 'function') {
							self.ongetvoices.call(this, urls);
						}

						if (typeof ongetvoices === 'function') {
							ongetvoices.call(this, urls);
						}
					}
				});
			};

			this.speak = function() {
				if (!self.urls) {
					ongetvoices = function() {
						self.play();
					};

					self.load();
				} else {
					self.play();
				}
			};

			delete this.set;

			if (args.autoplay === true) {
				self.speak();
			}

			if (args.autoload === false) {

			} else if (args.autoplay === false) {
				self.load();
			}
		}

		Class.players = AudioPlayer.players;

		return Class;
	})(window.AudioPlayer);



	var toret = {
		getMP3: getMP3,
		Speak: Speak
	};

	_.extend(context, toret);

	return toret;

})(window, window.$, window._, window.async);

var SettingsModule = (function(lS) {

	var get = function(name) {
		return lS(name);
	};

	var set = function(name, value) {
		return lS(name, value);
	};

	function init(callback) {

		if (!get('voiceSelector')) {
			set('voiceSelector', 19);
		}

		if (typeof callback === 'function') callback();
	}

	return {
		get: get,
		set: set,
		init: init
	};

})(lS);

var ContextMenuModule = (function(context, _, SpeakModule, SettingsModule) {

	var Speak = SpeakModule.Speak;

	var topMenu;

	function createTopMenu(callback) {
		var topMenuProperties = {
			type: 'normal',
			id: Math.floor(Math.random() * 9e9).toString(),
			title: 'Speak this using iVona',
			contexts: ['selection']
		};
		return chrome.contextMenus.create(topMenuProperties, function() {
			console.info('MENU CREATED');
			callback.call(this);
		});
	}

	function onMenuClicked(info) {
		//always will be
		if (info.menuItemId === topMenu) {

			if (Speak.players.length > 0){
				_.each(Speak.players, function(player){
					player.stop();
				});
			}

			new Speak({
				text: info.selectionText,
				voiceSelector: SettingsModule.get('voiceSelector'),
				autoplay: true,
				autoremove: true
			});

		} else {
			//TODO: remove
			throw new Error('WTF?');
		}
	}

	function init(callback) {
		topMenu = createTopMenu(function() {
			chrome.contextMenus.onClicked.addListener(onMenuClicked);
			if (typeof callback === 'function') callback();
		});
	}

	return {
		init: init
	};

})(window, window._, SpeakModule, SettingsModule);

(function(ContextMenuModule, SettingsModule) {
	SettingsModule.init();
	ContextMenuModule.init();
})(ContextMenuModule, SettingsModule);
