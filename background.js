var background = {
	config: {},
	links: {},

	init: function(){
		this.loadConfig();
		setInterval(this.fetchLinks, 5000);

		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
			if(request.fn in background){
				background[request.fn](request, sender, sendResponse);
			}
		});
	},

	loadConfig: function(){
		chrome.storage.local.get(["config"], function(items){
		  this.config = items;
		});
	},

	fetchLinks: function(){
		chrome.storage.local.get(['links'], function(items){
			background.links = items;
		});
	},

	getLinks: function(request, sender, sendResponse){
		sendResponse(background.links);
	},

  setLinks: function(request, sender, sendResponse){
    console.log("setLinks in background", request);
  },

	saveLinks: async function(request, sender, sendResponse) {
		devTab.saveLinks(this.links);
	},

	tabCreation: function(request, sender, sendResponse){
		devTab.init(request.links);
	}
}

background.init();
