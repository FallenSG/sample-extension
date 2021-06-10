var background = {
	init: function(){
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
			if(request.fn in background){
				background[request.fn](request, sender, sendResponse);
			}
		});
	},

	displayLinks: function(request, sender, sendResponse){

	},

	getLinks: function(request, sender, sendResponse){
		sendResponse(config.links);
	}
}

background.init();
