var console = chrome.extension.getBackgroundPage().console;

var popup = {
  init: function(){
    chrome.runtime.sendMessage({fn: "getLinks"}, function(response){
      if(response.links) popup.displayLinks(response.links);
      else document.getElementById('container').innerHTML = "Getting Started";
    });
  },

  checkSelector: function(MouseEvent){
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
              value="${links[key][title]}"> ${title} <br/>`;
          }

          divID.style.display = "block";
        }
        else divID.style.display = "none";
      });
    }
  },

  initTabCreation: function(){
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
		chrome.runtime.sendMessage({fn: "saveLinks"});
	}
};


document.addEventListener('DOMContentLoaded', popup.init);
document.addEventListener('click', popup.checkSelector);
document.getElementById('browse').addEventListener('click', popup.initTabCreation);
document.getElementById('save').addEventListener('click', popup.initSaveLinks);
