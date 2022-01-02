class Bkgd{
	#resFunc = {
		links: {},
		config: {},

		passCheck: function(request, sender, sendResponse){
			let code = 404;
			if(request.pass === this.config.password) code = 200;

			sendResponse({status: code});
		},

		purgeReq: function(request, sender, sendResponse){
			devStorage.purge(request.data, (items) => {
				if(items.links) this.links = items.links;
				if(items.config) this.config = items.config;
			});
		},

		changeConfig: function(request, sender, sendResponse){
			if(request.type === 'setPass'){
				this.config['password'] = request.val;
				this.config['isLocked'] = true;
			}

			else if(request.type === 'changePass'){
				this.config['password'] = request.val;
				this.config['isLocked'] = true;
			}

			else if(request.type === 'removePass'){
				this.config['password'] = '';
				this.config['isLocked'] = false;
			}

			devStorage.varSet({'config': this.config});
		},

		getWindowLinks: function(request, sender, sendResponse){
			let info = this.links[request.windowKeyVal];

			if(info) sendResponse({status: 200, reqLink: info});
			else sendResponse({status: 404});
		},	

		saveLinks: function(request, sender, sendResponse) {
			//callStack: nameSave/fastSave(setting.js).
			//Purpose: to execute the saveLinks(devTab) function for saving links.
			devTab.saveLinks(this.links, request.reqType);
		},

		tabCreation: function(request, sender, sendResponse){
			//callStack: initTabCreation(setting.js)

			//arg: contains selected links to open in request.links, contains "key" values
			// of selected links

			//Purpose: adding selected links using key values passed while also
			//	removing same from this.links. Then invoking tabCreation(devTab) function
			try{
				var openingLinks = [];
				let key = request.key;
				for(let val of request.selectedLinks){
					openingLinks.push(this.links[key][val]);
					delete this.links[key][val];
				}
				
				if(Object.keys(this.links[key]).length === 0){
					delete this.links[key];
				}
				
				devTab.tabCreation(openingLinks, key);
			} catch(err){
				console.log(err);
			}
			
		}
	}

	ackg(request, sender, sendResponse){
		console.log("Recieved msg hosted on background.js");
		sendResponse("msg acknowledegd");
	}

	constructor(){
		//Invokes certain function necessary for proper working of extension.
		//Also acts as listener for any messages and executes function
		//according to it.
		devStorage.init((items) => {
			this.#resFunc.config = items.config;
			this.#resFunc.links = items.links;
		});

		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			let proto = Object.getPrototypeOf(this);

			if(request.fn in this.#resFunc && !this.#resFunc.config.isLocked){
				this.#resFunc[request.fn](request, sender, sendResponse);
			}

			else if(request.fn in proto){
				this[request.fn](request, sender, sendResponse);
			}
		});
	}

	infoConstructor(){
		let keyVal = Object.keys(this.#resFunc.links);
		let passSet = this.#resFunc.config.password === '';

		return { status: 200, reqProp: {
			keyVal: keyVal, 
			passSet: passSet
			//extendable if more property based features are added.
		} };
	}

	getStatus(request, sender, sendResponse){
		//callStack: init(popup.js)
		//Purpose: to send this.links as response.
		if(this.#resFunc.config.isLocked){
			sendResponse({status: 401});
		} else{
			sendResponse(this.infoConstructor());
		}
	}

	lockToggler(request, sender, sendResponse){
		if(request.reqType === "lock") this.#resFunc.config.isLocked = true;
		else {
			if(request.pass === this.#resFunc.config.password){
				this.#resFunc.config.isLocked = false;
				sendResponse(this.infoConstructor());
			}
			sendResponse({status: 401});
		}
	}
}

var obj = new Bkgd();
