// var console = chrome.extension.getBackgroundPage().console;

var settingMenu = {
  'closeBtn': { 'name': '&times;' },
  'downloadLinks': { 'name': 'Download Links' },
  'downloadConfig': { 'name': 'Download Config' },
  'initPurgeAll': { 'name': 'Purge All Data' },
  'initConfPurge': { 'name': 'Clear Config' },
  'initLinksPurge': { 'name': 'Clear Links' },
  'setPass': { 'name': 'Set Password', 'prop': { 'passSet': true, 'mode': 'privMode' } },
  'changePass': { 'name': 'Change Password', 'prop': { 'passSet': false, 'mode': 'privMode' } },
  'removePass': { 'name': 'Remove Password', 'prop': { 'passSet': false, 'mode': 'privMode' } },
  'addBtn': { 'name': 'Add Links' }
  //'devMode': {'name': 'Developer Mode'}
};

class setting {
  #resFunc = {
    origFrame: "",

    setPass: function () {
      var pass = prompt("Enter Password");
      if (pass) {
        var confPass = prompt("Re-enter Password");
        if (pass != confPass) {
          alert("Password not Matching");
          return;
        }

        chrome.runtime.sendMessage({ fn: "changeConfig", type: "setPass", val: pass });
      }
    },

    closeBtn: () => {
      // let origFrame = this.#resFunc.
      var message = JSON.stringify({
        'frameId': this.#resFunc.origFrame
        //,
      });
      window.parent.postMessage(message, '*');
    },

    changePass: function () {
      var pass = prompt("Enter Current Password");
      chrome.runtime.sendMessage({ fn: "passCheck", pass: pass }, (response) => {
        if (response.status === 401) {
          alert("Wrong Password");
          return;
        }

        let newPass = prompt("Enter Your New Password");
        chrome.runtime.sendMessage({ fn: "changeConfig", type: "changePass", val: newPass });
      });
    },

    removePass: function () {
      var pass = prompt("Enter Your Password");
      chrome.runtime.sendMessage({ fn: "passCheck", pass: pass }, (response) => {
        if (response.status === 401) {
          alert("Wrong Password");
          return;
        }

        chrome.runtime.sendMessage({ fn: "changeConfig", type: "removePass" });
      });
    },

    downloadLinks: function () {
      chrome.storage.local.get(['links'], function (items) {
        var blob = new Blob([JSON.stringify({ 'links': items.links })], { type: "text/json" });
        var url = URL.createObjectURL(blob);

        chrome.downloads.download({ url: url });
      });
    },

    downloadConfig: function () {
      chrome.storage.local.get(['config'], function (items) {
        var blob = new Blob([JSON.stringify({ 'config': items.config })], { type: "text/json" });
        var url = URL.createObjectURL(blob);

        chrome.downloads.download({ url: url });
      });
    },

    initPurgeAll: function () {
      var conf = confirm("Do you wish to Continue");
      if (conf) chrome.runtime.sendMessage({ fn: "purgeReq", data: [] });
    },

    initConfPurge: function () {
      var conf = confirm("Do you wish to Continue");
      if (conf) chrome.runtime.sendMessage({ fn: "purgeReq", data: ['config'] });
    },

    initLinksPurge: function () {
      var conf = confirm("Do you wish to Continue");
      if (conf) chrome.runtime.sendMessage({ fn: "purgeReq", data: ['links'] });
    },

    displaySetter: function (reqProp) {
      //menuSetter
      //this js file will contain list of all setting btn
      //  and this func will set the menu depending upon status of extension.
      var element = document.getElementById('settingPage');
      for (let fn in settingMenu) {
        let prop = settingMenu[fn].prop;
        if (prop) {
          for (let val in prop) {
            if (val in reqProp && prop[val] === reqProp[val]) {
              element.innerHTML += `<a id="${fn}">${settingMenu[fn].name}</a> <br/>`;
            }
          }
        }
        else {
          element.innerHTML += `<a id="${fn}">${settingMenu[fn].name}</a> <br/>`;
        }
      }
    }
  }

  constructor() {
    document.addEventListener('click', (PointerEvent) => {
      let fn = PointerEvent.target.id;
      if (fn in this.#resFunc) {
        this.#resFunc[fn]();
      }
    });

    window.addEventListener('message', (resp) => {
      let data = JSON.parse(resp.data);
      this.#resFunc.origFrame = data.origFrame;
    });

    chrome.runtime.sendMessage({fn: 'getStatus'}, (response) => {
      // if(response.status === 401){}
      // else if(response.status === 200){
        this.#resFunc.displaySetter(response.reqProp);
      // }
    });
  }
}


function fileUpload(event) {
  //event needs to be changed for working with both type of upload
  //  or one function but changes upon upload content.
  //needs to be moved in super setting 
  //also requires some optimization like only accepting json file.
  //  handle multiple file input and setting.
  const fileList = event.target.files[0];
  const reader = new FileReader();

  reader.addEventListener('load', (evt) => {
    var file = evt.target.result;
    console.log(file);
  });

  reader.readAsText(fileList);
}

var settingObj = new setting();
