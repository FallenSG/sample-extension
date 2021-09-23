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
  'initFileSet': {'name': 'Upload', 'label': 'Config'}
}

var setting = {
  init: function(){
    displaySetter({ '.unlock': 'none', '.settingMenu': 'block' });

    setting.menuSetter();
  },

  menuSetter: function(){
    var element = document.getElementById('settingPage');
    for(btn in data){
      element.innerHTML += `<label>${data[btn].label}</label>`
      element.innerHTML += `<button id="${btn}">${data[btn].name}</button> <br\>`
    }
  },

  home: function(){
    displaySetter({ '.settingMenu': 'none', '.unlock': 'block' });
    document.getElementById('settingPage').innerHTML = '';
  },

  downloadLinks: function(){
    chrome.storage.local.get(['links'], function(items){
      var blob = new Blob([JSON.stringify(items.links)], {type: "text/json"});
      var url = URL.createObjectURL(blob);

      chrome.downloads.download({ url: url });
    });
  },

  downloadConfig: function(){
    chrome.storage.local.get(['config'], function(items){
      var blob = new Blob([JSON.stringify(items.config)], {type: "text/json"});
      var url = URL.createObjectURL(blob);

      chrome.downloads.download({ url: url });
    });
  },

  initPurgeAll: function(){
    chrome.runtime.sendMessage({fn: "purgeAll"});
  },

  initFileSet: function(){ console.log('initFileSet'); }
}

document.getElementById('settingBtn').addEventListener('click', setting.init);
document.addEventListener('click', EventHandler);
