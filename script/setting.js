// var console = chrome.extension.getBackgroundPage().console;

var settingMenu = {
  'closeBtn': { 'name': '&times;' },
  'linksPrtSetting': { 'name': 'Links Setting', 'childBtn': {
    'downloadLinks': { 'name': 'Download Links' },
    'initLinksPurge': { 'name': 'Clear Links' }
  }},
  
  'configPrtSetting': { 'name': 'Config Setting', 'childBtn': {
    'downloadConfig': { 'name': 'Download Config' },
    'initConfPurge': { 'name': 'Clear Config' }
  }}, 
  
  'initPurgeAll': { 'name': 'Purge All Data', 'prop': { 'mode': 'privMode' } },

  'passPrtSetting': { 'name': 'Password Setting', 'prop': {'mode': 'privMode'}, 'childBtn': {
    'setPass': { 'name': 'Set Password', 'prop': { 'passSet': true } },
    'changePass': { 'name': 'Change Password', 'prop': { 'passSet': false } },
    'removePass': { 'name': 'Remove Password', 'prop': { 'passSet': false } }
  }},
  'addBtn': { 'name': 'Add Links' }
  //'devMode': {'name': 'Developer Mode'}
};

class setting {
  #resFunc = {
    origFrame: "",

    toggleDispStyle: function(elem) { 
      let element = document.getElementById(elem);
      let dispStyle = 'block';

      if(element.style.display === 'block') dispStyle = 'none';
      element.style.display = dispStyle;
    },

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

    linksPrtSetting: function() {
      this.toggleDispStyle('linksPrtSettingDiv');
    }, 
    
    configPrtSetting: function() {
      this.toggleDispStyle('configPrtSettingDiv');
    }, 
    
    passPrtSetting: function() {
      this.toggleDispStyle('passPrtSettingDiv');
    },

    displaySetter: function (reqProp) {
      //menuSetter
      //this js file will contain list of all setting btn
      //  and this func will set the menu depending upon status of extension.
      var element = document.getElementById('settingPage');
      for (let fn in settingMenu) {
        this.estbElement(fn, settingMenu[fn], element, reqProp);
      }
    },

    estbElement: function(fn, elem, elemBlock, reqProp){
      let prop = elem.prop;
      let isValidElem = true;

      if(prop){
        for(let val in prop){
          if(prop[val] !== reqProp[val]){
            isValidElem = false;
            break;
          }
        }
      }

      if(isValidElem){
        if(elem.childBtn){
          elemBlock.innerHTML += `<a id="${fn}">${elem.name}</a> <br/>`;

          elemBlock.innerHTML += `<div id="${fn}Div" class="settingChildDiv"></div>`;
          let divBlock = document.getElementById(`${fn}Div`);

          for(let childFn in elem.childBtn){
            this.estbElement(childFn, elem.childBtn[childFn], divBlock, reqProp);
          }

        }

        else{
          elemBlock.innerHTML += `<a id="${fn}">${elem.name}</a> <br/>`;
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
        this.#resFunc.displaySetter(response);
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
