var console = chrome.extension.getBackgroundPage().console;

function randomWordGenerator(){
  //callStack: saveLinks(devTab.js)
  //Purpose: to creates random word from 'possible' within the range of 5-15.

  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(let i=0;i<(Math.random()*10)+5;i++){
    text += possible. charAt(Math. floor(Math. random() * possible. length));
  }
  return text;
}

var devTab = {
  browseWindow: {},

  tabCreation: function(links){
    for(const key in links){
      chrome.windows.create({url: links[key][0], incognito: true}, function(windows){
        for(let i=1;i<links[key].length;i++){
          chrome.tabs.create({url: links[key][i], windowId: windows.id});
        }

        devTab.browseWindow[windows.id] = key;
      });
    }
  },

  saveLinks: function(links, reqType){
    chrome.windows.getAll({populate: true}, function(windows_list){
      windows_list.forEach(function(window){

        if(window.incognito){
          let key = window.id;
          let tempLinks = {}, nameLinks = "";

          window.tabs.forEach(function(tab){
            tempLinks[tab.title] = tab.url;
            nameLinks += tab.title + "\n";
          });

          if(key in devTab.browseWindow) key = devTab.browseWindow[key];
          else{
            if(reqType === 'nameSave')
              key = prompt(nameLinks + "\nEnter Window Name for above mentioned links");
            if(!key) key = randomWordGenerator();
          }

          links[key] = tempLinks;
          chrome.windows.remove(window.id);
        }

      });
      chrome.storage.local.set({'links': links});
    });
  }
}
