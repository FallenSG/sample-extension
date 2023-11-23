class popup {
  #resFunc = {
    currFrame: ''
  }

  iframeMap = {
    'settingBtn': 'setting.html',
    'privMode': 'privMode.html',
    'pubMode': 'pubMode.html',
    'editPage': 'edit.html',
    'lockPage': 'lock.html',
    //for reversed mapping.
    'setting.html': 'settingBtn',
    'privMode.html': 'privMode',
    'pubMode.html': 'pubMode',
    'edit.html': 'editPage',
    'lock.html': 'lockPage'
  }

  constructor() {
    let frameObj = document.getElementById('bodyChange');
    let frameId;

    chrome.runtime.sendMessage({fn: 'frameToggler', reqType: 'fetch'}, (response) => {
      frameId = response.frameId.currFrame;
      frameObj.src = this.iframeMap[frameId];
    });

    //msg reciever for bringing change in frame src.
    window.addEventListener('message', (e) => {
      let data = JSON.parse(e.data);
      frameId = data.frameId;

      frameObj.src = this.iframeMap[frameId];

      if (frameId === 'lockPage') {
        chrome.runtime.sendMessage({ fn: "getStatus" }, function (response) {
          if (response.status === 200) {
            frameObj.src = 'privMode.html';
            frameId = 'privMode';
          }
        });
      }
    });

    frameObj.onload = () => {
      chrome.runtime.sendMessage({ fn: 'frameToggler', reqType: 'set', frameId: frameId }, (response) => {
        let msg = JSON.stringify({
          'origFrame': response.frameId.prevFrame
        });
        frameObj.contentWindow.postMessage(msg, '*');
      });
    }
  }
}

var obj = new popup();