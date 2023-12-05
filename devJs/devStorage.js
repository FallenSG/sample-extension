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

// var defConfig = {
//   'config': {
//     'isLocked': false,
//     'password': "",
//     'timeOff': 1
//   },
//   'links': {
//       // 'pubLinks': {},
//       // 'privLinks': {}
//   }
// };

var defConfig = {
  defAcc: {
    config: { isLocked: false, timeOff: 1, pass: "" },
    links: {
      public: {},
      private: {}
    }
  }
}

var devStorage = {
  init: function(callback = function(){}) {
    var setter = {}
    chrome.storage.local.get(function(items){
      setter = Object.assign({}, items);

      if(Object.keys(setter).length)
        return callback(setter)
      devStorage.varSet(defConfig, callback)
    })
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

  updateSet: function(acc, mode, data, callback = function(){}){
    chrome.storage.local.get(function(items){
      setter = Object.assign({}, items);

      for(key in data){
        setter[acc][mode][key] = data[key];
      }

      devStorage.varSet(setter, callback);
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

  view: function(data, callback=function(){}){
    //Purpose: takes an array of "key" values and fetches data
    //  in that "key" values from local storage and display it.
    chrome.storage.local.get(data, function(items){
      console.log({msg: "Data Fetch Complete", dataVal: items});
      callback(items);
    });
  },

  rename: function(links, keyVal, updLink){
    //link renaming
    for(key in updLink){
      for(index in updLink[key]){
        links[key][index][0] = updLink[key][index]
      }
    }

    //link renaming end

    //renaming windowName
    for(oldKey in keyVal){
      let newKey = keyVal[oldKey]

      let counter = 0, fname = newKey;
      while (fname in links) {
        counter++;
        fname = `${newKey}${counter}`;
      }
      newKey = fname;

      links[newKey] = links[oldKey]
      delete links[oldKey]; 
    }
    //windowName renaming ends here

    devStorage.varSet({ 'links': links });
  },

  deleteWindow: function(links, keyVal){
    keyVal.forEach((key) => {
      if(key in links){
        delete links[key];
      }
    })

    devStorage.varSet({ "links": links })
  },

  delLink: function(links, data){
    let elem = data.split('_');
    delete links[elem[0]][elem[1]];

    if(Object.keys(links[elem[0]]).length === 0)
      delete links[elem[0]]

    devStorage.varSet({ "links": links })
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
