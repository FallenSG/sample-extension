var setting = {
  EventHandler: function(PointerEvent){
    fn = PointerEvent.target.id;
      if(fn in setting){
        setting[fn]();
      }
      else if(fn in popup){
        popup[fn]();
      }
  }
}

document.addEventListener('click', setting.EventHandler);
document.getElementById('windowKey').addEventListener('change', popup.windowKey);


// function displaySetter(defStyle) {
//   for (key in defStyle) {
//     document.querySelectorAll(key).forEach((item) => {
//       item.style.display = defStyle[key]
//     });
//   }
// }
//
// function EventHandler(PointerEvent){
//   fn = PointerEvent.target.id;
//   if(fn in setting){
//     setting[fn]();
//   }
// }
//
// var data = {
//   'closeBtn': {'name': '&times;'},
//   'downloadLinks': {'name': 'Download Links'},
//   'downloadConfig': {'name': 'Download Config'},
//   'initPurgeAll': {'name': 'Purge All Data'},
//   'initConfPurge': {'name': 'Clear Config'},
//   'initLinksPurge': {'name': 'Clear Links'},
//   'setPass': {'name': 'Set Password'}
// }
//
// var setting = {
//   init: function(){
//     document.getElementById("settingPage").style.width = "250px";
//     document.getElementById("container").style.marginLeft = "250px";
//     document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
//
//     setting.menuSetter();
//   },
//
//   menuSetter: function(){
//     var element = document.getElementById('settingPage');
//
//     for(btn in data){
//         element.innerHTML += `<a id="${btn}">${data[btn].name}</a> <br/>`
//     }
//   },
//
//   closeBtn: function(){
//     document.getElementById("settingPage").style.width = "0";
//     document.getElementById("container").style.marginLeft = "0";
//     document.body.style.backgroundColor = "white";
//   },
//
//   downloadLinks: function(){
//     chrome.storage.local.get(['links'], function(items){
//       var blob = new Blob([JSON.stringify({'links': items.links})], {type: "text/json"});
//       var url = URL.createObjectURL(blob);
//
//       chrome.downloads.download({ url: url });
//     });
//   },
//
//   downloadConfig: function(){
//     chrome.storage.local.get(['config'], function(items){
//       var blob = new Blob([JSON.stringify({'config': items.config})], {type: "text/json"});
//       var url = URL.createObjectURL(blob);
//
//       chrome.downloads.download({ url: url });
//     });
//   },
//
//   initPurgeAll: function(){
//     var conf = confirm("Do you wish to Continue");
//     if(conf)  chrome.runtime.sendMessage({fn: "purgeReq", data: []});
//   },
//
//   initConfPurge: function(){
//     var conf = confirm("Do you wish to Continue");
//     if(conf)  chrome.runtime.sendMessage({fn: "purgeReq", data: ['config']});
//   },
//
//   initLinksPurge: function(){
//     var conf = confirm("Do you wish to Continue");
//     if(conf)  chrome.runtime.sendMessage({fn: "purgeReq", data: ['links']});
//   },
//
//   setPass: function(){
//     var pass = prompt("Enter New Password");
//     var confPass = prompt("Re-enter New Password");
//     if(pass === confPass && pass.length != 0){
//       chrome.runtime.sendMessage({fn: "changeConfig", var: "password", val: pass});
//     }
//   }
// }
//
// document.getElementById('settingBtn').addEventListener('click', setting.init);
// document.addEventListener('click', EventHandler);
