var console = chrome.extension.getBackgroundPage().console;

var app = {
	init: function() {
		// var elementPassed = document.getElementById('container');
		// keys = front(elementPassed);
		//
		// console.log(document);
	},

	browseWrite: function(){
		console.log("clicked browse");
	},

	browseSave: function(){

	}
};

document.addEventListener('DOMContentLoaded', app.init());
document.getElementById('save').addEventListener('click', app.browseSave);
document.getElementById('browse').addEventListener('click', app.browseWrite);
