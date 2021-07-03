var background = {
	config: {},
	openedLink: {},

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

	browseLinks: function(request, sender, sendResponse){
		background.openedLink = request.links;
	},

	saveLinks: function(request, sender, sendResponse) {
		// chrome.storage.local.set(updatedConfig, function(){
		//   console.log(updatedConfig);
		// });
		devTab.saveLinks(background.openedLink);
		console.log("data reached saveConfig ", request);
		sendResponse({message: "Data has arrived"});
	},

	getLinks: function(request, sender, sendResponse){
		sendResponse(config.links);
	},

	tabCreation: function(request, sender, sendResponse){
		devTab.init(request.links);
	}
}

background.init();
