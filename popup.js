var console = chrome.extension.getBackgroundPage().console;
var saveConfig = chrome.extension.getBackgroundPage().saveConfig;

var app = {
	init: function() {
		// var elementPassed = document.getElementById('container');
		// keys = front(elementPassed);
		//
		// console.log(document);
	},

	browseWrite: function(){
	},

	browseSave: function(){
		chrome.runtime.sendMessage({fn: "saveConfig", data: "item"}, function(response){
			console.log(response);
		});
	}
};

document.addEventListener('DOMContentLoaded', app.init());
document.getElementById('save').addEventListener('click', app.browseSave);
document.getElementById('browse').addEventListener('click', app.browseWrite);
