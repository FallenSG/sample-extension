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
    await promisifiedDataSetter(file);
  },

  varSet: function(data){
    chrome.storage.local.set(data, function(){
      console.log({msg: "Data set Complete", dataVal: data});
    })
  },

  purgeAll: function(){
    chrome.storage.local.clear();
    console.log({msg: "Cleared all stored data"});
  },

  purge: function(data){
    chrome.local.storage.remove(data, function(){
      console.log({msg: "Data Purge completed"});
    });
  },

  view: function(data){
    chrome.storage.local.get(data, function(items){
      console.log({msg: "Data Fetch Complete", dataVal: items});
    });
  }
}

// devStorage.fileSet('config.json');
// devStorage.varSet({config: {}});
// devStorage.view(['links', 'config']);
