var background = {
	config: {},

	init: function(){
		this.loadConfig();

		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
			if(request.fn in background){
				background[request.fn](request, sender, sendResponse);
			}
		});
	},

	loadConfig: function(){
		chrome.storage.local.get(["links"], function(items){
		  this.config = items;
		});
	},

	saveConfig: function(request, sender, sendResponse) {
		// chrome.storage.local.set(updatedConfig, function(){
		//   console.log(updatedConfig);
		// });
		console.log("data reached saveConfig ", request);
		sendResponse({message: "Data has arrived"});
	},

	getLinks: function(request, sender, sendResponse){
		sendResponse(config.links);
	}
}

background.init();
