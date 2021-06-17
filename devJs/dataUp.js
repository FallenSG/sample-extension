// A js script designed for making the developer life easy.
// How you ask, well if you are debugging while working on it
// and you need to check using a specific data then you can
// simply add the data in json format to the project folder
// and here you simply pass the name of the file

// Note: You also need to add the script name in the manifest.json
// before background.js

function dataSetter(file){
  var configFile = {};

  var promiseObj = new Promise(function(resolve, reject){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      if(xhr.readyState === 4 && xhr.status === 200){
        configFile = JSON.parse(xhr.response);
        chrome.storage.local.set(configFile);
        resolve({text: "Data set succesfull.. ", dataVal: configFile, status: xhr.status});
      }

      else if (xhr.readyState === 4) {
        reject({text: "File does not exist", status: xhr.status});
      }
    }

    xhr.open("GET", file, true);
    xhr.send();
  });

 return promiseObj;
}

function promiseHandler(msg){
  if(msg.status === 200) console.log(msg);
  else console.log(msg.text);
}

function dataViewer(insights){
  var msg = {};
  chrome.storage.local.get([insights], function(items) {
    console.log({text:"Data Fetch Completed.. ", dataVal: items});
  });
}

function init(){
  dataSetter("/config.json").then(promiseHandler, promiseHandler);
  dataViewer("links");

}

init();
