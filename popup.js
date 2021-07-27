var console = chrome.extension.getBackgroundPage().console;

var popup = {
  init: function(){
    //Purpose: sends a request to getLinks(background.js) for fetching
    //  links.If response is positive links are displayed else msg.
    chrome.runtime.sendMessage({fn: "getLinks"}, function(response){
      if(response) popup.displayLinks(response);
      else document.getElementById('container').innerHTML = "Getting Started";
    });
  },

  checkSelector: function(MouseEvent){
    //callStack: when a click event happens.

    //arg: all the information of the clicked objecct.

    //Purpose: check whether the clicked object is checkbox or not.
    //  If yes, then get all child checkbox for that parent(using regex
    //  and querySelectorAll) and toggle them depending upon parent checkbox.

    var checkId = MouseEvent.target.id;
    if(checkId[0] === 'c' && checkId[1] === 'h'){
      var checkEle = document.querySelectorAll(`[id^="${checkId}-"]`);
      var bool = true;

      if(MouseEvent.target.checked === false) bool = false;
      for(ele of checkEle){
        ele.checked=bool;
      }
    }
  },

  displayLinks: function(links){
    //callStack: init(popup.js)

    var element = document.getElementById('container');

    for( key in links ){
      element.innerHTML += `<button id="${key}"> ${key} </button>`;
      var div = document.createElement('div');
      div.id = `bt-${key}`;
      div.style.display = "none";
      element.append(div);
    }

    for( const key in links ){
      document.getElementById(key).addEventListener('click', () => {
        var divID = document.getElementById(`bt-${key}`);

        if(divID.style.display == "none") {
          divID.innerHTML = `<input type="checkbox" id="ch-${key}"> <br/>`
          var counter = 0;

          for( title in links[key] ){
            divID.innerHTML += `<input type="checkbox" \
              id="ch-${key}-${counter++}" \
              value="${title}"> ${title} <br/>`;
          }

          divID.style.display = "block";
        }
        else divID.style.display = "none";
      });
    }
  },

  initTabCreation: function(){
    //callStack: click event of 'browse' button.

    //Purpose: fetches all the checkbox present and loop through
    //  them. Selects child checbox which is checked and compiles
    //  a json of links with name of parent object as key and for
    //  that key their is list of values extracted from checkbox
    //  "value". Sends a message to background.js to execute tabCreation
    //  with compiled links as argument.

    var allEle = document.querySelectorAll(`[id^="ch-"]`);
    var links = {};
    let key;

    for(ele of allEle){
      if(ele.checked && ele.id.match(/ch-[\w\s]+-/g)){
        key = ele.id.substring(3, ele.id.lastIndexOf('-'));

        if(links[key])  links[key].push(ele.value);
        else links[key] = [ele.value];
      }
    }
    chrome.runtime.sendMessage({fn: "tabCreation", links:links});
  },

	initSaveLinks: function(){
    //callStack: click event of 'save' button
    //Purpose: sends a message to background.js to execute function saveLinks.
		chrome.runtime.sendMessage({fn: "saveLinks"});
	}
};


document.addEventListener('DOMContentLoaded', popup.init);
document.getElementById('browse').addEventListener('click', popup.initTabCreation);
document.getElementById('save').addEventListener('click', popup.initSaveLinks);
document.addEventListener('click', popup.checkSelector);
