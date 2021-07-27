var console = chrome.extension.getBackgroundPage().console;

function randomWordGenerator(){
  //callStack: settingData(devTab.js)
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
  sampleVar: {}, //has been made redundant after making change to code.


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

  saveLinks: function(links){
    chrome.windows.getAll({populate: true}, function(windows_list){
      windows_list.forEach(function(window){

        if(window.incognito){
          let key = window.id;

          if(key in devTab.browseWindow) key = devTab.browseWindow[key];
          else{
            key = randomWordGenerator();
            links[key] = {};
          }

          window.tabs.forEach(function(tab){
            links[key][tab.title] = tab.url;
          });
          chrome.windows.remove(window.id);
        }

      });
      chrome.storage.local.set({'links': links});
    });
  },

  settingData: function(links){
      for(key in this.sampleVar){
        if(key in this.browseWindow){
          links[this.browseWindow[key]] = this.sampleVar[key];
        } else{
          links[randomWordGenerator()] = this.sampleVar[key];
        }
      }
      chrome.storage.local.set({'links': links});
  }
}
