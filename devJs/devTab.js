var devTab = {
  init: function(links){
    for(const key in links){
      chrome.windows.create({url: links[key][0], incognito: true}, function(windows){
        for(let i=1;i<links[key].length;i++){
          chrome.tabs.create({url: links[key][i], windowId: windows.id});
        }

        browserWindow[windows.id] = key;
      });
    }
    console.log(links);
    chrome.runtime.sendMessage({fn: "browseLinks", links: links});
  },

  saveLinks: function(openedLink){
    for(const key in openedLink){
      chrome.windows.get({windowId: key}, function(windows){
        console.log(windows);
      })
    }
  }
}


//   // chrome.windows.getAll({populate: false, windowTypes: ['normal']}, function(windowList) {
//   //   for (let windows of windowList) {
//   //       if (windows.incognito === isIncognito) {
//   //           // Use this window.
//   //           for(let url in links["7"]){
//   //             console.log(url);
//   //           }
//   //           chrome.tabs.create({url: link, windowId: windows.id});
//   //           return;
//   //       }
//   //   }
//   //
//   //   // No incognito window found, open a new one.
//   //   chrome.windows.create({url: link, incognito: isIncognito});
//   // });
// }
//
// function closeSave(){
//
// }
// chrome.storage.local.get(["links"], (items) => { createTab(items.links, true) });
