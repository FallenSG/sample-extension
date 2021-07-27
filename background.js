var background = {
	config: {}, //variable used to store configuration loaded from storage.
	links: {}, //variable used to store links loaded from storage.

	init: function(){
		//Invokes certain function necessary for proper working of extension.
		//Also acts as listener for any messages and executes function
		//according to it.

		this.loadConfig();
		setInterval(this.fetchLinks, this.config.refresh_time);

		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
			if(request.fn in background){
				background[request.fn](request, sender, sendResponse);
			}
		});
	},

	loadConfig: function(){
		//callStack: init(background.js)
		//Purpose: fetches 'config' from local storage and sets it to this.config
		chrome.storage.local.get(["config"], function(items){
		  this.config = items;
		});
	},

	fetchLinks: function(){
		//callStack: init(background.js)
		//Purpose: invokes at certain interval of time to fetch 'links'
		//	from local storage and set it to this.links.
		chrome.storage.local.get(['links'], function(items){
			background.links = items.links;
		});
	},

	getLinks: function(request, sender, sendResponse){
		//callStack: init(popup.js)
		//Purpose: to send this.links as response.
		sendResponse(background.links);
	},

	saveLinks: function(request, sender, sendResponse) {
		//callStack: initSaveLinks(popup.js).
		//Purpose: to execute the saveLinks(devTab) function for saving links.
		devTab.saveLinks(this.links);
	},

	tabCreation: function(request, sender, sendResponse){
		//callStack: initTabCreation(popup.js)

		//arg: contains selected links to open in request.links, contains "key" values
		// of selected links

		//Purpose: adding selected links using key values passed while also
		//	removing same from this.links. Then invoking tabCreation(devTab) function

		var openingLinks = {};
		for(windows in request.links){
			openingLinks[windows] = [];
			for(key of request.links[windows]){
				openingLinks[windows].push(this.links[windows][key]);
				delete this.links[windows][key];
			}
		}
		chrome.storage.local.set({'links': this.links})
		devTab.tabCreation(openingLinks);
	}
}

background.init();
