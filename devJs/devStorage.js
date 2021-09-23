//*Documentation required

function FileDataSetter(file){
  //callStack: promisifiedDataSetter(devStorage.js)
  //Purpose: perfroms an ajax request to fetch file from its path and
  //  sets it to local storage.
  var setFile = {};

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4 && xhr.status === 200){
      setFile = JSON.parse(xhr.response);
      chrome.storage.local.set(setFile);
      console.log({msg: "Data has been set..", dataVal: setFile});
    }

    else if (xhr.readyState === 4) {
       console.log({text: "File does not exist"});
    }
  };

  xhr.open("GET", file, true);
  xhr.send();
}


function promisifiedDataSetter(file, timeOut=1500){
  return new Promise(function(resolve, reject) {
    setTimeout(function (currentFile) {
      resolve(FileDataSetter(currentFile));
    }, timeOut, file);
  });
}

var defConfig = {
  'config': {
    'isLocked': false,
    'password': ""
  },
  'links': {}
};

var devStorage = {
  init: function() {
    chrome.storage.local.get(['config', 'links'], function(items){
      if(!items.config)
        chrome.storage.local.set({'config': defConfig.config});
      if(!items.links)
        chrome.storage.local.set({'links': defConfig.links});
    });
  },

  fileSet: async function(file){
    //Purpose: takes an file path and executes async function below.
    await promisifiedDataSetter(file); //file path is must and timeOut can be set.
  },

  varSet: function(data){
    //Purpose: only takes data and set it to local storage.
    chrome.storage.local.set(data, function( ){
      console.log({msg: "Data set Complete", dataVal: data});
    })
  },

  purgeAll: function(){
    //Purpose: clears all "key" values from local storage.
    chrome.storage.local.clear(function(){
      console.log({msg: "Cleared all stored data"});
      devStorage.varSet(defConfig);
    });
  },

  purge: function(data){
    //Purpose: takes an array of "key" values and remove them from
    //  local storage.
    chrome.storage.local.remove(data, function(){
      console.log({msg: "Data Purge completed"});
    });
  },

  view: function(data){
    //Purpose: takes an array of "key" values and fetches data
    //  in that "key" values from local storage and display it.
    chrome.storage.local.get(data, function(items){
      console.log({msg: "Data Fetch Complete", dataVal: items});
    });
  }
}

devStorage.init();

var workConfig = {
  'isLocked': true,
  'password': 'fallen'
}
// devStorage.purgeAll();
// devStorage.fileSet('./links.json');
// devStorage.varSet({config: workConfig});
// devStorage.view(['links', 'config']);
// devStorage.purge(['links']);
