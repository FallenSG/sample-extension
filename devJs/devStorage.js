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
        if(key === 'links')
          setter[acc][key][mode] = data[key];
        else 
          setter[acc][key] = data[key];
      }

      devStorage.varSet(setter, callback);
    });
  },

  renameAcc: function(acc, name, callback = () => {}){
    chrome.storage.local.get((items) => {
      let keys = Object.keys(items);
      let counter=0;
      while (keys.includes(name)){
        counter++;
        name = `${name}${counter}`;
      }

      items[name] = Object.assign({}, items[acc]);

      var setter = Object.assign({}, items);
      chrome.storage.local.set(setter, () => this.accPurge(acc, callback));
    })
  },

  purge: function(acc, data, callback){
    //Purpose: takes an array of "key" values and remove them from
    //  local storage.
    chrome.storage.local.get((items) => {
      if(data.length === 0)
        items[acc] = defConfig['defAcc'];
      // else if(data[0] === 'acc')
      //   delete items[acc];
      else{
        if(data[0] === 'config')
          items[acc]['config'] = defConfig['defAcc']['config'];
        else{
          items[acc]['links'][data[1]] = defConfig['defAcc']['links'][data[1]];
        }
      }

      devStorage.varSet(items, callback);
    })
  },

  accPurge: function(acc, callback = ()=>{}){
    chrome.storage.local.remove(acc, callback);
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
