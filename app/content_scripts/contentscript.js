'use strict';

(function($) {

	var csrfield = $('input#VoiceTesterForm_csrfield').val();

	function getMP3(text, voiceSelector, callback) {
		var params = {
				ext: 'mp3',
				voiceSelector: voiceSelector,
				text: text,
				send: 'Play',
				csrfield: csrfield,
				'ref-form-name': 'VoiceTesterForm'

			};

		$.post('http://www.ivona.com/let-it-speak/?setLang=us', params)
			.then(function(data) {
				try {
					var url;

					data.script.replace(/audioUpdate\(\'([\w\W]{1,}?)\'\)/igm, function(m ,p1){
						url = p1;
					});

					callback(null, url);
				} catch(e) {
					callback({id:'regexp-url', data: e});
				}
			})
			.fail(function(err) {
				callback(err);
			});
	}


	// listener to chrome messages api
	chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
		//log message for debuging
		//console.info('CONTENT_SCRIPT_MESSAGE', msg, sender);

		//only accept messages from background
		if ('tab' in sender === false) {
			if (typeof msg.text === 'string' && typeof msg.voiceSelector === 'number'){
				getMP3(msg.text, msg.voiceSelector, function(err, url){
					sendResponse({err: err, url: url});
				});

				//make async
				return true;
			}

		}	
	});

})(window.$);
