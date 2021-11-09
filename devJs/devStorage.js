//*Documentation required

function fileDataSetter(file, callback = function(){}){
  //callStack: fileSet(devStorage.js)
  //Purpose: perfroms an ajax request to fetch file from its path and
  //  sets it to local storage.
  var setFile = {};

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4 && xhr.status === 200){
      setFile = JSON.parse(xhr.response);
      chrome.storage.local.set(setFile, function(){
        console.log({msg: "Data has been set..", dataVal: setFile});
        callback(setFile);
      });
    }

    else if (xhr.readyState === 4) {
       console.log({err: "File does not exist"});
    }
  };

  xhr.open("GET", file, true);
  xhr.send();
}

var defConfig = {
  'config': {
    'isLocked': false,
    'password': ""
  },
  'links': {}
};

var devStorage = {
  init: function(callback = function(){}) {
    var setter = {}
    chrome.storage.local.get(['config', 'links'], function(items){
      setter = Object.assign({}, items);

      if(!setter.config) setter['config'] = defConfig['config'];
      if(!setter.links) setter['links'] = defConfig['links'];

      if(setter === items) callback(setter);
      else if(JSON.stringify(setter) !== "{}")  devStorage.varSet(setter, callback);
    });
  },

  fileSet: function(file, callback){
    //Purpose: takes an file path and executes async function below.
    fileDataSetter(file, callback); //file path is must and timeOut can be set.
  },

  varSet: function(data, callback = function(){}){
    //Purpose: only takes data and set it to local storage.
    chrome.storage.local.set(data, function(){
      console.log({msg: "Data set Complete", dataVal: data});
      callback(data);
    });
  },

  purge: function(data, callback){
    //Purpose: takes an array of "key" values and remove them from
    //  local storage.
    var config = {};
    if(data.length === 0){
      config = defConfig;
    } else{
      for(key of data){
        if(key in defConfig) config[key] = defConfig[key];
      }
    }

    devStorage.varSet(config, callback);
  },

  purgeAll: function(callback = function(){}){
    chrome.storage.local.clear(callback());
  },

  view: function(data){
    //Purpose: takes an array of "key" values and fetches data
    //  in that "key" values from local storage and display it.
    chrome.storage.local.get(data, function(items){
      console.log({msg: "Data Fetch Complete", dataVal: items});
    });
  }
}


var workConfig = {
  'isLocked': true,
  'password': 'fallen'
}
// devStorage.purgeAll();
// devStorage.fileSet('/links.json');
// devStorage.varSet({config: workConfig});
// devStorage.varSet(defConfig);
// devStorage.view(['links', 'config']);
// devStorage.purge(['links']);
