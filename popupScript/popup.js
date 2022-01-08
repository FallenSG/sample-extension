var console = chrome.extension.getBackgroundPage().console;

var settingMenu = {
  'closeBtn': {'name': '&times;'},
  'downloadLinks': {'name': 'Download Links'},
  'downloadConfig': {'name': 'Download Config'},
  'initPurgeAll': {'name': 'Purge All Data'},
  'initConfPurge': {'name': 'Clear Config'},
  'initLinksPurge': {'name': 'Clear Links'},
  'setPass': {'name': 'Set Password', 'prop': {'passSet': true}},
  'changePass': {'name': 'Change Password', 'prop': {'passSet': false}},
  'removePass': {'name': 'Remove Password', 'prop': {'passSet': false}} //,
  //'devMode': {'name': 'Developer Mode'}
};

function displayChange(status) {
  let unlock = document.getElementById('unlock').style;
  let lock = document.getElementById('lock').style
  let body = document.getElementsByTagName('body')[0].style;

  try{
    if(status === 'unlock'){
      unlock.display = 'block';
      lock.display = 'none';

      body.height = '500px';
      body.width = '450px';
    }

    else{
      lock.display = 'block';
      unlock.display = 'none';

      body.height = '300px';
      body.width = '250px';
    }
  } catch(err){
    console.error(err);
  }
}

var popup = {
  init: function(){
    chrome.runtime.sendMessage({fn: "getStatus"}, function(response){
      if(response.status === 401) displayChange('lock');

      else if(response.status === 200){
        displayChange('unlock');
        popup.displaySetter(response.reqProp);
      }
    });
  },

  displaySetter: function(reqProp){
    //menuSetter
    //this js file will contain list of all setting btn
    //  and this func will set the menu depending upon status of extension.
    var element = document.getElementById('settingPage');

    for(fn in settingMenu){
      let prop = settingMenu[fn].prop;
      if(prop){
        for(val in prop){
          if(val in reqProp && prop[val] === reqProp[val]){
             element.innerHTML += `<a id="${fn}">${settingMenu[fn].name}</a> <br/>`;
          }
        }
      }
      else{
        element.innerHTML += `<a id="${fn}">${settingMenu[fn].name}</a> <br/>`;
      }
    }

    //selectSetter
    container.innerHTML = 'Let Get Started !!!';
    let sel = document.getElementById('windowKey');

    sel.innerHTML = '<option>----Select a Window----</option>'
    for(val of reqProp.keyVal){
      sel.innerHTML += `<option value='${val}'>${val}</option>`;
    }
  },

  displayLinks: function(){
   let sel = document.getElementById('windowKey');
   let val = sel.options[sel.selectedIndex].value;
   let cont = document.getElementById('container');
   cont.innerHTML = '';

   chrome.runtime.sendMessage({fn: 'getWindowLinks', windowKeyVal: val}, function(response){
     if(response.status === 404){
       cont.innerHTML = "Lets Get Started !!!";
     }

     else{
       cont.innerHTML += '<table id="displayTable"></table>'
       let table = document.getElementById('displayTable');
       table.innerHTML = '<tr> <th></th> \
         <th> <input id="checkSelector" type="checkbox"> </th> </tr>'

       for(title in response.reqLink){
         table.innerHTML += `<tr> <td> ${title} </td> \
           <td> <input id="${title}" type='checkbox'> </td> </tr>`
       }
     }
   });
  },

  closeBtn: function(){
    document.getElementById('settingPage').style.width = 0;
  },

  settingBtn: function(){
    document.getElementById('settingPage').style.width = "100%";
  },

  addBtn: function(){
    document.getElementById("addPage").style.height = "100%";
  },

  closeAddPage: function(){
    document.getElementById("addPage").style.height = 0;
  },

  checkSelector: function(){
    var bool = document.getElementById('checkSelector').checked;
    var checkEle = document.getElementsByTagName('input');

    for(ele of checkEle){
      ele.checked = bool;
    }
  },

  unlockBtn: function () {
    chrome.runtime.sendMessage({ fn: 'lockToggler', reqType: 'lock'});

    document.getElementById('container').innerHTML = '';
    document.getElementById('lockMsg').innerHTML = '';
    document.getElementById('settingPage').innerHTML = '';
    displayChange('lock');
  },

  lockBtn: function(){
    var pass = document.getElementById('lockIn').value;
    document.getElementById('lockIn').value = '';

    chrome.runtime.sendMessage({ fn: 'lockToggler', reqType: 'unlock', pass: pass }, function (response) {
      if (response.status === 200) {
        displayChange('unlock');
        popup.displaySetter(response.reqProp);
      }
      else {
        document.getElementById('lockMsg').innerHTML = "Wrong Password";
      }
    });
  },

  home: function(){
    let select = document.getElementById('windowKey');
    select.selectedIndex = select.options[0];
    document.getElementById('container').innerHTML = 'Let Get Started !!!';
  }
}
