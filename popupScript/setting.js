function displaySetter(defStyle) {
  for (key in defStyle) {
    document.querySelectorAll(key).forEach((item) => {
      item.style.display = defStyle[key]
    });
  }
}

function EventHandler(PointerEvent){
  fn = PointerEvent.target.id;
  if(fn in setting){
    setting[fn]();
  }
}

var data = {
  'downloadLinks': {'name': 'Download', 'label': 'Download Links'},
  'downloadConfig': {'name': 'Download', 'label': 'Download Config'},
  'initPurgeAll': {'name': 'Purge All', 'label': 'Clear All Data'},
  'initConfPurge': {'name': 'Clear', 'label': 'Clear Config'},
  'initLinksPurge': {'name': 'Clear', 'label': 'Clear Links'},
  'setPass': {'name': 'Set Password', 'label': 'Set Password'}
}

var setting = {
  init: function(){
    displaySetter({ '.unlock': 'none', '.settingMenu': 'block' });

    setting.menuSetter();
  },

  menuSetter: function(){
    var element = document.getElementById('settingPage');
    element.innerHTML += `<table id='menuTable'> </table>`;
    var table = document.getElementById('menuTable');

    for(btn in data){
      table.innerHTML += `<tr> <td> <label>${data[btn].label}</label> </td>
        \ <td> <button id="${btn}">${data[btn].name}</button> </td> </tr>`
    }
  },

  home: function(){
    displaySetter({ '.settingMenu': 'none', '.unlock': 'block' });
    document.getElementById('settingPage').innerHTML = '';
  },

  downloadLinks: function(){
    chrome.storage.local.get(['links'], function(items){
      var blob = new Blob([JSON.stringify({'links': items.links})], {type: "text/json"});
      var url = URL.createObjectURL(blob);

      chrome.downloads.download({ url: url });
    });
  },

  downloadConfig: function(){
    chrome.storage.local.get(['config'], function(items){
      var blob = new Blob([JSON.stringify({'config': items.config})], {type: "text/json"});
      var url = URL.createObjectURL(blob);

      chrome.downloads.download({ url: url });
    });
  },

  initPurgeAll: function(){
    var conf = confirm("Do you wish to Continue");
    if(conf)  chrome.runtime.sendMessage({fn: "purgeReq", data: []});
  },

  initConfPurge: function(){
    var conf = confirm("Do you wish to Continue");
    if(conf)  chrome.runtime.sendMessage({fn: "purgeReq", data: ['config']});
  },

  initLinksPurge: function(){
    var conf = confirm("Do you wish to Continue");
    if(conf)  chrome.runtime.sendMessage({fn: "purgeReq", data: ['links']});
  },

  setPass: function(){
    var pass = prompt("Enter New Password");
    var confPass;
    if(pass){
      confPass = prompt("Re-enter New Password");
      if(pass === confPass) chrome.runtime.sendMessage();
    }
  }
}

document.getElementById('settingBtn').addEventListener('click', setting.init);
document.addEventListener('click', EventHandler);
