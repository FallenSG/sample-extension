// var console = chrome.extension.getBackgroundPage().console;

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

function generateUniqueID() {
  return Math.random().toString(36).substr(2, 9); // Example method to generate a random unique ID
}

var devTab = {
  browseWindow: {},

  tabCreation: function(mode, links, key){
    mode = mode === 'private';
    chrome.windows.create({url: links[0], incognito: mode}, function(windows){
      for(let i=1;i<links.length;i++){
        chrome.tabs.create({url: links[i], windowId: windows.id});
      }
      devTab.browseWindow[windows.id] = key;
    });
  },

  saveLinks: function(links, reqType, val){
    chrome.windows.getAll({populate: true}, function(windows_list){
      windows_list.forEach(function(window){

        if(window.incognito){
          let key;
          let tempLinks = {}, nameLinks = "";

          window.tabs.forEach(function(tab){
            let tabId = generateUniqueID()
            while(tempLinks[tabId])
              tabId = generateUniqueID()

            tempLinks[tabId] = [tab.title, tab.url];
            nameLinks += tab.title + "\n";
          });

          if(window.id in devTab.browseWindow) key = devTab.browseWindow[window.id];
          else{
            if(reqType === 'saveAll'){
              //used to create prompt taking name for the window
              //but manifest v3 doesnt allow that.
              //alternative is been researched.
            }
              // key = prompt(nameLinks + "\nEnter Window Name for above mentioned links");
            if(!key) key = randomWordGenerator();

            let counter = 0, fname = key;
            while(fname in links){
              counter++;
              fname = `${key}${counter}`;
            }
            key = fname;
          }

          if(links[key]) links[key] = {...links[key], ...tempLinks};
          else links[key] = tempLinks;
          chrome.windows.remove(window.id);
        }

      });
      chrome.storage.local.set({'links': links});
    });
  },

  saveLinksNew: async function(links, acc, reqType, sendResponse){
    const parentWindow = await chrome.windows.getCurrent();
    chrome.windows.getAll({ populate: true }, function(windows_list){
      windows_list.forEach((window) => {
        let nameArr = [];
        if(parentWindow.id !== window.id){
          let key, tempLinks = {}, nameLinks = "";
          window.tabs.forEach(function(tab){
            let tabId = generateUniqueID()
            while (tempLinks[tabId])
              tabId = generateUniqueID()

            tempLinks[tabId] = [tab.title, tab.url];
            nameLinks += tab.title + "\n";
          })

          if (window.id in devTab.browseWindow) key = devTab.browseWindow[window.id];
          else if(reqType === 'fastSave'){
            key = randomWordGenerator();
            
            let counter = 0, fname = key;
            while (fname in links) {
              counter++;
              fname = `${key}${counter}`;
            }
            key = fname;
          }
        }
      })
    })
  },

  saveSingle: function(acc, reqType, sendResponse){
    links = {
      'public': {},
      'private': {}
    }
    mode = 'public';
    
    chrome.windows.getCurrent({populate: true}, (window) => {
      let tempLinks = {};
      if(!(window.id in devTab.browseWindow))
        sendResponse({ status: 200  });


      window.tabs.forEach((tab) => {
        let tabId = generateUniqueID()
        while(tempLinks[tabId])
          tabId = generateUniqueID()
        tempLinks[tabId] = [tab.title, tab.url];
      })

      if (window.id in devTab.browseWindow) val = devTab.browseWindow[window.id];
      else{
        mode = window.incognito ? 'private' : 'public';
        if(val !== "")
          val = randomWordGenerator()
      }

      links[mode][val] = tempLinks;
      
      chrome.windows.remove(window.id);
      devStorage.addSet(acc, links);
    })
  }
}
