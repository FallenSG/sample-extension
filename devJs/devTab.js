function randomWordGenerator(){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(let i=0;i<(Math.random()*10)+5;i++){
    text += possible. charAt(Math. floor(Math. random() * possible. length));
  }

  return text;
}

var devTab = {
  browseWindow: {},
  sampleVar: {},


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

  promisifedTabCreation: function(links){
    return new Promise((resolve, reject) => {
      setTimeout(function (currentLinks) {
        resolve(devTab.tabCreation(currentLinks));
      }, 1500, links);
    });
  },

  saveLinks: function(data){
    chrome.windows.getAll({populate: true}, function(windows_list){
      windows_list.forEach((window) => {
        if(window.incognito){
          devTab.sampleVar[window.id] = {};
          window.tabs.forEach((tab) => {
            devTab.sampleVar[window.id][tab.title] = tab.url;
          });
        }
      });
      devTab.settingData(data.links);
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
  },

  init: async function(links){
    await devTab.promisifedTabCreation(links);
    console.log("after opening links browseWindow", this.browseWindow);
  }
}
