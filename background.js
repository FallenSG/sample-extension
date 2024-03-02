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
		acc: "",
		mode: "public",
		links: {},
		config: {},
		timeStamp: 0,
		parentTab: null,

		infoConstructor: function(keyVal) {
			var msg = msgFormat;
			//required fields
			msg.mode = this.frameId.currFrame;
			msg.passSet = this.config.pass === '';
			msg.timeStamp = this.timeStamp;

			for (let key in keyVal) {
				msg[key] = keyVal[key];
			}

			return msg;
		},

		passCheck: function(request, sender, sendResponse){
			let code = 401;

			hasher(request.pass).then((hash) => {
				if(hash === this.config.pass) code = 200;
				
				sendResponse( this.infoConstructor({
					status: code
				}));
			});
		},

		isPassReq: function(request, sender, sendResponse){
			var passReq = false;
			if(this.config.pass !== ""){
				passReq = true;
			}
			sendResponse( this.infoConstructor({
				passReq
			}) );
		},

		purgeReq: function(request, sender, sendResponse){
			devStorage.purge(this.acc, request.data, (items) => {
				if(items.links) this.links = items.links;
				if(items.config) this.config = items.config;
			});
		},

		deleteAcc: function(request, sender, sendResponse){
			devStorage.accPurge(this.acc, () => {
				sendResponse(this.infoConstructor({
					status: 200
				}))
			})
		},

		changeConfig: function(request, sender, sendResponse){
			return new Promise( (resolve, reject) => {
				if(request.type === 'setPass' || request.type === 'changePass'){
					hasher(request.val).then((hash) => {
						this.config['pass'] = hash;
						this.config['isLocked'] = true;
						resolve(this.config);
					});
				}

				else if(request.type === 'removePass'){
					this.config['pass'] = '';
					this.config['isLocked'] = false;
					resolve(this.config);
				}
			}).then(result => {
				devStorage.updateSet(this.acc, this.mode, {'config': result});
				// this.config['isLocked'] = false;
			});
		},

		renameAcc: function(request, sender, sendResponse){
			devStorage.renameAcc(this.acc, request.name, () => {
				this.acc = request.name
			});
		},

		getWindowLinks: function(request, sender, sendResponse){
			let info = this.links[request.windowKeyVal];
			let msg = {};

			if(info) msg = {status: 200, reqLink: info};
			else msg = {status: 404};

			sendResponse( this.infoConstructor(msg));
		},

		saveLinks: function(request, sender, sendResponse) {
			//callStack: saveAll/fastSave(setting.js).
			//Purpose: to execute the saveLinks(devTab) function for saving links.
			devTab.saveLinksNew(this.acc, request.reqType);
		},
		
		saveSingle: function(request, sender, sendResponse){
			devTab.saveSingle(this.acc, request.reqType, request.val);
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
					openingLinks.push(this.links[key][val][1]);
					delete this.links[key][val];
				}

				if(Object.keys(this.links[key]).length === 0){
					delete this.links[key];
				}

				devTab.tabCreation(this.mode, openingLinks, key);
				devStorage.updateSet(this.acc, this.mode, { "links": this.links });
			} catch(err){
				console.log(err);
			}

		},

		renameLinks: function(request, sender, sendResponse){
			var {keyVal, updLink, ...others } = request;
			
			for (let key in updLink) {
				for (let index in updLink[key]) {
					this.links[key][index][0] = updLink[key][index]
				}
			}
			//link renaming end

			//renaming windowName
			for (let oldKey in keyVal) {
				let newKey = keyVal[oldKey]

				let counter = 0, fname = newKey;
				while (fname in this.links) {
					counter++;
					fname = `${newKey}${counter}`;
				}
				newKey = fname;

				this.links[newKey] = this.links[oldKey]
				delete this.links[oldKey];
			}

			devStorage.updateSet(this.acc, this.mode, { 'links': this.links });
			// devStorage.rename(this.acc, this.mode, this.links, request.keyVal, request.updLink)
			sendResponse({ status: 200 })
		},

		deleteWindow: function(request, sender, sendResponse){
			request.keyVal.forEach((key) => {
				if(key in this.links){
					delete this.links[key];
				}
			})
			devStorage.updateSet(this.acc, this.mode, { 'links': this.links });
			sendResponse({ status: 200 });
		},

		delLink: function(request, sender, sendResponse){
			var [windowName, linkName] = request.data.split('_');
			delete this.links[windowName][linkName];

			if(Object.keys(this.links[windowName]).length === 0 )
				delete this.links[windowName];

			devStorage.updateSet(this.acc, this.mode, {'links': this.links} );
			sendResponse({ status: 200 });
		},

		signOut: function(request, sender, sendResponse){
			this.acc = "";
			this.mode = "public";
			this.links = {};
			this.config = {};

			sendResponse(this.infoConstructor({
				status: 200
			}));
		}
	}

	ackg(request, sender, sendResponse){
		console.log("Recieved msg hosted on background.js");
		sendResponse("msg acknowledegd");
	}

	constructor(){
		//Invokes function necessary for proper working of extension.
		//Also acts as listener for any messages and executes function

		try {
			importScripts('/devJs/devStorage.js', '/devJs/devTab.js', '/script/msgFormat.js', '/devJs/crypt.js');
		} catch (e) {
			console.error(e);
		}

		devStorage.init((items) => {
			let key = Object.keys(items);
			if(key.length === 1){
				this.#resFunc.acc = key[0];
				const { config, links } = items[this.#resFunc.acc];
				this.#resFunc.links = links['public'];
				this.#resFunc.config = config
			}
			else{
				this.#resFunc.frameId['currFrame'] = 'account'
				this.#resFunc.acc = key;
			}
		});

		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			let proto = Object.getPrototypeOf(this);

			if(request.fn === 'signOut'){
				this.#resFunc['signOut'](request, sender, sendResponse);
			}

			else if(request.fn in this.#resFunc && !this.#resFunc.config.isLocked){
				this.#resFunc[request.fn](request, sender, sendResponse);
			}

			else if(request.fn in proto){
				this[request.fn](request, sender, sendResponse);
			}
			return true; //meant for keeping msging port open even in case of async functions.
		});
	}

	fetchAcc(request, sender, sendResponse){
		if(request.origin === 'setting')
			sendResponse(this.#resFunc.infoConstructor({
				acc: this.#resFunc.acc
			}));
		else{
			devStorage.view(null, (items) => {
				let keys = Object.keys(items);
				sendResponse(this.#resFunc.infoConstructor({
					acc: keys
				}))
			})
		}
	}

	activateAcc(request, sender, sendResponse){
		devStorage.view(request.acc, (items) => {
			this.#resFunc.acc = request.acc;
			const { links, config } = items[this.#resFunc.acc];
			this.#resFunc.links = links['public'];
			this.#resFunc.config = config
		})

		sendResponse( this.#resFunc.infoConstructor({
			status: 200
		}) )
	}

	frameToggler(request, sender, sendResponse){
		//send frame to be shown.
		if(request.reqType === "set"){
			let frameId = {}
			if(request.frameId === ""){
				frameId['currFrame'] = this.#resFunc.frameId.prevFrame;
				frameId['prevFrame'] = this.#resFunc.frameId.currFrame;
			}

			else if(request.frameId !== this.#resFunc.frameId.currFrame){
				frameId['currFrame'] = request.frameId;
				frameId['prevFrame'] = this.#resFunc.frameId.currFrame;
			}

			this.#resFunc.frameId = frameId;

			if(frameId.currFrame === "pubMode" || frameId.currFrame === 'privMode'){
				this.#resFunc.mode = frameId.currFrame === 'privMode' ? 'private' : 'public';

				devStorage.view(this.#resFunc.acc, (items) => {
					this.#resFunc.links = items[this.#resFunc.acc]['links'][this.#resFunc.mode];
				})
			}
		}
		
		sendResponse( this.#resFunc.infoConstructor({
			status: 200, frameId: this.#resFunc.frameId
		}));
	}

	getStatus(request, sender, sendResponse){
		//callStack: init(popup.js)
		//Purpose: to send this.links as response.

		//also need to send frame to be displayed.
		//additonal if statement for checking time limit 
		let msg = {};
		let lastVisit = Date.now() - this.#resFunc?.timeStamp;
		let maxAllowTime = this.#resFunc.config.timeOff * 60;

		//below if statement needs correction in the form that
		//lastVisit > maxAllowTime should be checked only if pass is set
		//else this is a bug on the condition that it keeps taking you to 
		//lockPage even though there is not pass to compare it to.

		if(this.#resFunc.config.isLocked && this.#resFunc.config.pass !== "" && lastVisit > maxAllowTime){
			msg = { status: 401 }
		} else{
			this.#resFunc.timeStamp = Date.now();
			let keyVal = Object.keys(this.#resFunc.links);
			msg = { 'status': 200, 'keyVal': keyVal };
		}

		sendResponse ( this.#resFunc.infoConstructor(msg) )
	}

	lockToggler(request, sender, sendResponse){
		if(request.reqType === "lock") this.#resFunc.config.isLocked = true;
		else {
			let statusCode = 401;
		  	hasher(request.pass).then((hash) => {
				if(hash === this.#resFunc.config.pass){
					this.#resFunc.config.isLocked = false;
					statusCode = 200;
					//set timestamp of when unlocked.
				}
				sendResponse( this.#resFunc.infoConstructor({
					status: statusCode
				}));
			});
		}
	}
}

var obj = new Bkgd();
