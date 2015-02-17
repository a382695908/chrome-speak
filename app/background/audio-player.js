'use strict';

(function(context, _, $) {

	/**
	 * Execute a function passed by a param only if it is a valid function
	 * @param {function} the ufnction
	 * @return {boolean} if the function is valid or not
	 */
	function execute(fn, args) {
		if (typeof fn === 'function') {
			fn.apply(this, _.isArray(args) ? args : []); 			/* jshint ignore:line */
			return true;
		} else {
			return false;
		}
	}

	function AudioPlayer(args) {
		//check args
		args = _.isObject(args) ? args : {};

		//constants
		var self = this;

		//private attributes
		var urls,
			players,
			currentPlayer;


		//public attributes
		var playing = this.playing = false;

		//events
		this.onended = null;
		this.onendedblock = null;
		this.onremoved = null;
		this.onstopped = null;
		this.onpaused = null;
		this.onplay = null;

		//methods
		this.play = function play() {
			if (!urls) {
				throw new Error('Can\'t play before setting the playing audio urls.');
			} else {
				playing = self.playing = true;
				currentPlayer = currentPlayer || _.first(players);
				currentPlayer.play();
				execute.call(self, self.onplay);
			}
		};

		this.stop = function stop() {
			self.playing = playing = false;

			if (currentPlayer) {
				currentPlayer.load();
				currentPlayer.pause();
				currentPlayer = null;
			}

			execute.call(self, self.onstopped);
		};

		this.pause = function pause() {
			if (playing) {
				self.playing = playing = false;
				currentPlayer.pause();
			}

			execute.call(self, self.onpaused);
		};

		this.remove = function remove() {
			if (playing) {
				self.stop();
			}

			_.each(players, function(player) {
				$(player).remove();
			});

			currentPlayer = players = null;

			execute.call(undefined, self.onremoved);

			_.forIn(self, function(value, key) {
				delete self[key];
			});
		};

		//setters
		this.set = function set(name, value) {
			if (name === 'urls') {
				if (!playing) {
					if (_.isArray(value) && _.every(value, _.isString)) {
						urls = value;

						if (players) {
							_.each(players, function(player) {
								$(player).remove();
							});
						}

						players = _.map(urls, function(url) {
							var $player = $('<audio>', {
									src: url,
									preload: 'preload'
								}),
								player = $player.get(0);

							$('body').append($player);

							player.onended = onPlayerEnded;

							return player;
						});

					} else {
						throw new Error('Invalid urls:', value);
					}
				} else {
					throw new Error('Can\'t set urls while playing');
				}
			} else {
				console.warn('Undefined attribute "' + name + '" on set.');
			}
		};

		//private methods
		function onPlayerEnded(){
			var player = this;			/* jshint ignore:line */
			var index = players.lastIndexOf(player);

			if (index < players.length - 1){
				//currentPlayer at the begining
				currentPlayer.load();
				currentPlayer.pause();
				//current player is the next
				currentPlayer = players[index + 1];
				currentPlayer.play();
				execute.call(self, self.onendedblock, [player]);
			} else {
				self.stop();
				execute.call(self, self.onendedblock, [player]);
				execute.call(self, self.onended);
			}
		}


		this.get = function get(name) {
			if (name === 'urls') {
				return urls;
			} else {
				console.warn('Undefined attribute "' + name + '" on get.');
			}
		};


		//constructor	
		(function constructor() {
			AudioPlayer.players.push(self);

			if (args.autoplay === true)
				self.play();

			if (args.urls)
				self.set('urls', args.urls);

		})();
	}

	AudioPlayer.players = [];

	context.AudioPlayer = AudioPlayer;

})(window, window._, window.$);
