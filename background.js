var bkgd = {
	config: {}, //variable used to store configuration loaded from storage.
	links: {}, //variable used to store links loaded from storage.

	ackg: function(request, sender, sendResponse){
		console.log("Recieved msg hosted on background.js");
		sendResponse("msg acknowledegd");
	},

	init: function(){
		//Invokes certain function necessary for proper working of extension.
		//Also acts as listener for any messages and executes function
		//according to it.

		this.loadConfig();

		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
			if(request.fn in bkgd){
				bkgd[request.fn](request, sender, sendResponse);
			}
		});
	},

	loadConfig: function(){  //use is redundant
		//callStack: init(background.js)
		//Purpose: fetches 'config' from local storage and sets it to this.config
		chrome.storage.local.get(["config", "links"], function(items){
		  bkgd.config = items.config;
			bkgd.links = items.links;
		});
	},

	fetchLinks: function(request, sender, sendResponse){ //deprecated
		//callStack: init(background.js)
		//Purpose: invokes at certain interval of time to fetch 'links'
		//	from local storage and set it to this.links.
		chrome.storage.local.get(['links', 'config'], function(items){
			sendResponse(items.links);
		});
	},

	getStatus: function(request, sender, sendResponse){
		//callStack: init(popup.js)
		//Purpose: to send this.links as response.
		if(this.config.isLocked){
			sendResponse({isLocked: true});
		} else{
			sendResponse({isLocked: false, links: bkgd.links});
		}
	},

	saveLinks: function(request, sender, sendResponse) {
		//callStack: initSaveLinks(popup.js).
		//Purpose: to execute the saveLinks(devTab) function for saving links.
		devTab[request.btnClick](bkgd.links);
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
		devTab.tabCreation(openingLinks);
	},

	unlockFunc: function(request, sender, sendResponse){
		if(request.pass === bkgd.config.password){
			bkgd.config.isLocked = false;
			sendResponse({status: 200, links: bkgd.links});
		}
		sendResponse({status: 401});
	},

	lockFunc: function(request, sender, sendResponse){
		bkgd.config.isLocked = true;
	},

	purgeReq: function(request, sender, sendResponse){
		devStorage.purge(request.data, function(items){
			if(items.links) bkgd.links = items.links;
			if(items.config) bkgd.config = items.config;
		});
	}
}

bkgd.init();


var search = {
	    title: "Search on",
	    id: "searchEngine",
	    contexts:["selection", "image"]
	};

  chrome.contextMenus.create(search);

  chrome.contextMenus.create({
    title: "Google",
    parentId: "searchEngine",
    id: "google",
    contexts: ["selection"],
		onclick: function(e){
			console.log(e);
		}
  });


	chrome.contextMenus.create({
		title: "Bing",
		parentId: "searchEngine",
		id: "bing",
		contexts: ["image"],
		onclick: function(e){
			console.log(e);
		}
	});
