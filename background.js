async function hasher(message) {
	const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
	const hashBuffer = await crypto.subtle.digest('SHA-512', msgUint8);           // hash the message
	const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
	return hashHex;
}

class Bkgd{
	#resFunc = {
		frameId: {"currFrame": "pubMode", 'prevFrame': ''},
		links: {},
		config: {},

		passCheck: function(request, sender, sendResponse){
			let code = 401;
			hasher(request.pass).then((hash) => {
				if(hash === this.config.password) code = 200;
				sendResponse({status: code});
			});
		},

		purgeReq: function(request, sender, sendResponse){
			devStorage.purge(request.data, (items) => {
				if(items.links) this.links = items.links;
				if(items.config) this.config = items.config;
			});
		},

		changeConfig: function(request, sender, sendResponse){
			return new Promise( (resolve, reject) => {
				if(request.type === 'setPass' || request.type === 'changePass'){
					hasher(request.val).then((hash) => {
						this.config['password'] = hash;
						this.config['isLocked'] = true;
						resolve(this.config);
					});
				}

				else if(request.type === 'removePass'){
					this.config['password'] = '';
					this.config['isLocked'] = false;
					resolve(this.config);
				}
			}).then(result => {
				devStorage.varSet({'config': result});
			});
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
		try {
			importScripts('/devJs/devStorage.js', '/devJs/devTab.js');
		} catch (e) {
			console.error(e);
		}

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
			return true; //meant for keeping msging port open even in case of async functions.
		});
	}

	infoConstructor(){
		//changes arguments depending upon call.
		let keyVal = Object.keys(this.#resFunc.links);
		let passSet = this.#resFunc.config.password === '';

		return { status: 200, reqProp: {
			keyVal: keyVal,
			passSet: passSet,
			mode: ''
			//extendable if more property based features are added.
		} };
	}

	frameToggler(request, sender, sendResponse){
		//send frame to be shown.
		if(request.reqType === 'set' && request.frameId !== this.#resFunc.frameId.currFrame){
			let frameId = {'currFrame': request.frameId};
			frameId['prevFrame'] = this.#resFunc.frameId.currFrame;
			this.#resFunc.frameId = frameId;
		} 

		sendResponse({
			status: 200, frameId: this.#resFunc.frameId
		});
	}

	getStatus(request, sender, sendResponse){
		//callStack: init(popup.js)
		//Purpose: to send this.links as response.

		//needs change for timestamp comparison and many more
		//also need to send frame to be displayed.
		if(this.#resFunc.config.isLocked){
			sendResponse({status: 401});
		} else{
			sendResponse(this.infoConstructor());
		}
	}

	lockToggler(request, sender, sendResponse){
		if(request.reqType === "lock") this.#resFunc.config.isLocked = true;
		else {
		  hasher(request.pass).then((hash) => {
				if(hash === this.#resFunc.config.password){
					this.#resFunc.config.isLocked = false;
					//set timestamp of when unlocked.
					//response is changed from info to ackg of password recieved
					//whether it is wrong or right so, basically remove this one
					//and update last one.
					sendResponse(this.infoConstructor());
				}
				sendResponse({status: 401});
			});
		}
	}
}

var obj = new Bkgd();
