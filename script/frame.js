// var console = chrome.extension.getBackgroundPage().console;

var frame = {
    init: function () {
        //extra func to send a msg to bkgd.js   
        chrome.runtime.sendMessage({fn: 'getStatus'}, function(response){            
            if(response.status === 401) frame.postMsg('lockPage');

            else if(response.status === 200) frame.displaySetter(response.keyVal);
        });
    },

    postMsg: function(btnId){    
        var message = JSON.stringify({
            'frameId': btnId,
            'origFrame': ''
            //,
        });
        window.parent.postMessage(message, '*');
    },

    EventHandler: function(event){
        let btnId = event.target.id;
        if(btnId in frame){
            frame[btnId]();
        }

        else if(btnId === 'privMode' || btnId === 'pubMode' || btnId ==='settingBtn' || btnId === "editPage"){
            frame.postMsg(btnId);
        }

        else if(btnId === 'fastSave' || btnId === 'saveAll'){
            chrome.runtime.sendMessage({
                fn: 'saveLinks', reqType: btnId 
            });
        }

        else if(btnId === "save"){
            chrome.runtime.sendMessage({ fn: "saveSingle", reqType: 'save' });
        }

        else if(btnId === "saveColl"){
        }
    },

    browse: function () {
        var links = [];
        var checkEle = document.getElementById('container').getElementsByTagName('input');
        var select = document.getElementById('windowKey');
        var key = select.options[select.selectedIndex].value;

        for(ele of checkEle){
            if(ele.checked && ele.id != 'checkSelector') links.push(ele.id);
        }

        chrome.runtime.sendMessage({fn: "tabCreation", key: key, selectedLinks: links});
    },

    displaySetter: function (keyVal) {
        //selectSetter
        container.innerHTML = 'Let Get Started !!!';
        let sel = document.getElementById('windowKey');

        sel.innerHTML = '<option>----Select a Window----</option>'
        for (val of keyVal) {
            sel.innerHTML += `<option value='${val}'>${val}</option>`;
        }
    },

    checkSelector: function () {
        var bool = document.getElementById('checkSelector').checked;
        var checkEle = document.getElementsByTagName('input');

        for (ele of checkEle) {
            ele.checked = bool;
        }
    },

    home: function () {
        let select = document.getElementById('windowKey');
        select.selectedIndex = select.options[0];
        document.getElementById('container').innerHTML = 'Let Get Started !!!';
    },

    SignOutBtn: function(){
        chrome.runtime.sendMessage({ fn: "signOut" }, (resp) => {
            this.postMsg("account")
        })
    },

    displayLinks: function(){
        let sel = document.getElementById('windowKey');
        let val = sel.options[sel.selectedIndex].value;
        let cont = document.getElementById('container');
        cont.innerHTML = '';

        chrome.runtime.sendMessage({fn: 'getWindowLinks', windowKeyVal: val}, function(resp){
            if(resp.status === 404){
                cont.innerHTML = "Lets Get Started !!!";
            }

            else{
                cont.innerHTML += '<table id="displayTable"></table>'
                let table = document.getElementById('displayTable');
                table.innerHTML = '<tr> <th></th> \
                    <th> <input id="checkSelector" type="checkbox"> </th> </tr>'

                for(let key in resp.reqLink){
                    table.innerHTML += `<tr> <td> ${resp.reqLink[key][0]} </td> \
                    <td> <input id="${key}" type='checkbox'> </td> </tr>`
                }
            }
        });
    }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    sendResponse({ val: "sent" })
})

window.addEventListener('message', () => {}); //if needed.
document.addEventListener('DOMContentLoaded', frame.init);
document.addEventListener('click', frame.EventHandler);
document.getElementById('windowKey').addEventListener('change', frame.displayLinks);
