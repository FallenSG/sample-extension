// A js script designed for making the developer life easy.
// How you ask, well if you are debugging while working on it
// and you need to check using a specific data then you can
// simply add the data in json format to the project folder
// and here you simply pass the name of the file

// How to use -
//  dataSetter('file_name_here_with_path') to set the json file
//    content in browser local storage
//  dataViewer('key_name') to fetch the data from browser local
//    storage and checking values of that key.


//  Note: Need to see whether promisifed version of this works
//  already has created it but test phase is still pending
//  so pay caution.

//Need to refine the code with the  need to setting function properly

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

var devStorage = {
  fileSet: async function(file){
    //Purpose: takes an file path and executes async function below.
    await promisifiedDataSetter(file); //file path is must and timeOut can be set.
  },

  varSet: function(data){
    //Purpose: only takes data and set it to local storage.
    chrome.storage.local.set(data, function(){
      console.log({msg: "Data set Complete", dataVal: data});
    })
  },

  purgeAll: function(){
    //Purpose: clears all "key" values from local storage.
    chrome.storage.local.clear();
    console.log({msg: "Cleared all stored data"});
  },

  purge: function(data){
    //Purpose: takes an array of "key" values and remove them from
    //  local storage.
    chrome.local.storage.remove(data, function(){
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

// devStorage.fileSet('config.json');
// devStorage.varSet({config: {refresh_time: 500}});
// devStorage.view(['links', 'config']);
