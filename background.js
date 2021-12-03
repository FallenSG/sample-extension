class Bkgd{
	#config = {}; //variable used to store #configuration loaded from storage.
	#links = {}; //variable used to store links loaded from storage.

	ackg(request, sender, sendResponse){
		console.log("Recieved msg hosted on background.js");
		sendResponse("msg acknowledegd");
	}

	constructor(){
		//Invokes certain function necessary for proper working of extension.
		//Also acts as listener for any messages and executes function
		//according to it.
		devStorage.init((items) => {
			this.#config = items.config;
			this.#links = items.links;
		});

		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			let proto = Object.getPrototypeOf(this);
			var methods = Object.getOwnPropertyNames(proto);
			methods.shift();

			if(request.fn in proto){
				this[request.fn](request, sender, sendResponse);
			}
		});
	}

	getStatus(request, sender, sendResponse){
		//callStack: init(popup.js)
		//Purpose: to send this.links as response.
		if(this.#config.isLocked){
			sendResponse({isLocked: true});
		} else{
			sendResponse({isLocked: false, links: this.#links});
		}
	}

	saveLinks(request, sender, sendResponse) {
		//callStack: initSaveLinks(popup.js).
		//Purpose: to execute the saveLinks(devTab) function for saving links.
		devTab.saveLinks(this.#links, request.reqType);
	}

	tabCreation(request, sender, sendResponse){
		//callStack: initTabCreation(popup.js)

		//arg: contains selected links to open in request.links, contains "key" values
		// of selected links

		//Purpose: adding selected links using key values passed while also
		//	removing same from this.links. Then invoking tabCreation(devTab) function

		var openingLinks = {};
		for(windows in request.links){
			openingLinks[windows] = [];
			for(key of request.links[windows]){
				openingLinks[windows].push(this.#links[windows][key]);
				delete this.#links[windows][key];
			}
			if(Object.keys(bkgd.#links[windows]).length === 0){
				delete bkgd.#links[windows];
			}
		}
		devTab.tabCreation(openingLinks);
	}

	lockToggler(request, sender, sendResponse){
		if(request.reqType === "lock") this.#config.isLocked = true;
		else {
			if(request.pass === this.#config.password){
				this.#config.isLocked = false;
				sendResponse({status: 200, links: this.#links});
			}
			sendResponse({status: 401});
		}
	}

	purgeReq(request, sender, sendResponse){
		devStorage.purge(request.data, (items) => {
			if(items.links) this.#links = items.links;
			if(items.config) this.#config = items.config;
		});
	}

	changeConfig(request, sender, sendResponse){
		if(request.var === 'password'){
			this.#config['password'] = request.val;
			this.#config['isLocked'] = true;
		}

		devStorage.varSet({'config': this.#config});
	}
}

var obj = new Bkgd();
