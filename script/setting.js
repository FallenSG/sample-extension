// var console = chrome.extension.getBackgroundPage().console;

var settingMenu = {
  'closeBtn': { 'name': '&times;' },
  'renameAcc': { 'name': "Rename Account" },
  'links_PrtSetting': { 'name': 'Links Setting', 'childBtn': {
    'links_download': { 'name': 'Download Links' },
    'public_purge': { 'name': 'Clear Public Links' },
    'private_purge': { 'name': 'Clear Private Links' }
  }},
  
  'config_PrtSetting': { 'name': 'Config Setting', 'childBtn': {
    'config_download': { 'name': 'Download Config' },
    'config_purge': { 'name': 'Clear Config' }
  }}, 
  
  
  'pass_PrtSetting': { 'name': 'Password Setting', 'childBtn': {
    'setPass': { 'name': 'Set Password', 'prop': { 'passReq': false } },
    'changePass': { 'name': 'Change Password', 'prop': { 'passReq': true } },
    'removePass': { 'name': 'Remove Password', 'prop': { 'passReq': true } }
  }},
  //'addBtn': { 'name': 'Add Links' },
  'all_purge': { 'name': 'Reset Account' },
  'accPurge': { 'name': "Delete Account" }
  //'devMode': {'name': 'Developer Mode'}
};

class setting {
  #resFunc = {
    origFrame: "",
    passReq: false,

    passCheck: async function(askConf=false, callback = () => {}){
      return new Promise((resolve, reject) => {
        if(this.passReq){
          var pass = prompt("Enter Password to continue: ");

          if (pass !== null) {
            // resolve();
            chrome.runtime.sendMessage({ fn: "passCheck", pass }).then((resp) => {
              if (resp.status === 401)
                return alert("Wrong Password");
              resolve();
            })
          }
        }

        else if (askConf) {
          var conf = confirm("Do you wish to continue: ")
          if (conf) resolve();
        }

        else 
          resolve();
      });
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
      this.passCheck().then(() =>  {
        let newPass = prompt("Enter Your New Password");
        chrome.runtime.sendMessage({ fn: "changeConfig", type: "changePass", val: newPass });
      })
    },

    removePass: function () {
      this.passCheck().then(() => {
        chrome.runtime.sendMessage({ fn: "changeConfig", type: "removePass" });
      })
    },

    download: function(data){
      this.passCheck().then(() => {
        chrome.runtime.sendMessage({ fn: "fetchAcc", origin: "setting" }, (resp) => {
          var acc = resp.acc;
          chrome.storage.local.get([acc], (items) => {
            var blob = new Blob([JSON.stringify({ 'data': items[acc][data] })], { type: "text/json" });
            var url = URL.createObjectURL(blob);

            chrome.downloads.download({ url: url });
          })
        })
      })
    },

    purge: function(data){
      this.passCheck(true).then(() => {
        var toBePurged = [];

        if(data === 'config')
          toBePurged.push('config');
        else if(data !== 'all'){
          toBePurged.push('links');
          toBePurged.push(data);
        }

        chrome.runtime.sendMessage({ fn: "purgeReq", data: toBePurged }, (resp) => {
          
        });
      })
    },

    accPurge: function(){
      //to be completed
      this.passCheck(true).then(() => {
        chrome.runtime.sendMessage({ fn: 'deleteAcc' }, (resp) => {
          var message = JSON.stringify({
            'frameId': 'account'
            //,
          });
          window.parent.postMessage(message, '*');
        });
      })
    },

    renameAcc: function(){
      var name = prompt("Enter a new username: ")
      if(name !== null){
        chrome.runtime.sendMessage({ fn: "renameAcc", name });
      }
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
      let [ forePart, subPart ] = fn.split('_');

      if(subPart === 'PrtSetting'){
        let element = document.getElementById(fn + 'Div');
        let dispStyle = 'block';

        if (element.style.display === 'block') dispStyle = 'none';
        element.style.display = dispStyle;
      }

      else if(subPart){
        this.#resFunc[subPart](forePart);
      }

      else if (fn in this.#resFunc) {
        this.#resFunc[fn]();
      }
    });

    window.addEventListener('message', (resp) => {
      let data = JSON.parse(resp.data);
      this.#resFunc.origFrame = data.origFrame;
    });

    chrome.runtime.sendMessage({fn: 'getStatus'}, (response) => {
      if(response.status === 401){

      }
      else if(response.status === 200){
        chrome.runtime.sendMessage({ fn: "isPassReq" }, (resp) => {
          this.#resFunc.passReq = resp.passReq;
          this.#resFunc.displaySetter(resp);
        })
      }
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
