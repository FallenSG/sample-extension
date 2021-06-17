// A js script designed for making the developer life easy.
// How you ask, well if you are debugging while working on it
// and you need to check using a specific data then you can
// simply add the data in json format to the project folder
// and here you simply pass the name of the file

// Note: You also need to add the script name in the manifest.json
// before background.js

function dataSetter(file){
  var configFile = {};

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4 && xhr.status === 200){
      configFile = JSON.parse(xhr.response);
      chrome.storage.local.set(configFile);
      console.log({msg: "Data has been set..", dataVal: configFile});
    }

    else if (xhr.readyState === 4) {
       console.log({text: "File does not exist"});
    }
  };

  xhr.open("GET", file, true);
  xhr.send();
}

function dataViewer(insights){
  chrome.storage.local.get([insights], function(items) {
    var msg = {text:"Data Fetch Completed.. ", dataVal: items};
    console.log(msg);
  });
}

dataSetter('/new_config.json');
