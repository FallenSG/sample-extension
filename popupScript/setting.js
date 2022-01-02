var console = chrome.extension.getBackgroundPage().console;

var setting = {
  EventHandler: function(PointerEvent){
    // console.log(PointerEvent.path[2].cells[0].innerText, PointerEvent.path);
    fn = PointerEvent.target.id;
       if(fn in setting){
        setting[fn]();
      }
      else if(fn in popup){
        popup[fn]();
      }
  },

  fastSave: function(){
    chrome.runtime.sendMessage({'fn': 'saveLinks', reqType: 'fastSave'});
  },

  nameSave: function(){
    chrome.runtime.sendMessage({'fn': 'saveLinks', reqType: 'nameSave'});
  },

  browse: function(){
    var links = [];
    var checkEle = document.getElementById('container').getElementsByTagName('input');
    var select = document.getElementById('windowKey');
    var key = select.options[select.selectedIndex].value;

    for(ele of checkEle){
      if(ele.checked && ele.id != 'checkSelector') links.push(ele.id);
    }

    chrome.runtime.sendMessage({fn: "tabCreation", key: key, selectedLinks: links});
  },

  setPass: function() {
    var pass = prompt("Enter Password");
    if(pass){
      var confPass = prompt("Re-enter Password");
      if(pass != confPass){
        alert("Password not Matching");
        return;
      }
      
      chrome.runtime.sendMessage({fn: "changeConfig", type: "setPass", val: pass});
    }
  },

  changePass: function(){
    var pass = prompt("Enter Current Password");
    chrome.runtime.sendMessage({fn: "passCheck", pass: pass}, (response) => {
      if(response.status === 404) {
        alert("Wrong Password");
        return;
      }

      let newPass = prompt("Enter Your New Password");
      chrome.runtime.sendMessage({fn: "changeConfig", type: "changePass", val: newPass});
    });
  },

  removePass: function(){
    var pass = prompt("Enter Your Password");
    chrome.runtime.sendMessage({fn: "passCheck", pass: pass}, (response) => {
      if(response.status === 404){
        alert("Wrong Password");
        return;
      }

      chrome.runtime.sendMessage({fn: "changeConfig", type: "removePass"});
    });
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
  }
}

document.addEventListener('DOMContentLoaded', popup.init);
document.addEventListener('click', setting.EventHandler);
document.getElementById('windowKey').addEventListener('change', popup.displayLinks);
