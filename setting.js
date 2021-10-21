var console = chrome.extension.getBackgroundPage().console;

function displaySetter(defStyle){
  for (key in defStyle) {
    document.querySelectorAll(key).forEach((item) => {
      item.style.display = defStyle[key]
    });
  }
}

function unlockFunc() {
  displaySetter({'.unlock': 'block', '.lock': 'none'});
}

function lockFunc(){
  displaySetter({'.lock': 'block', '.unlock': 'none'});
}

function settingFunc(){
  displaySetter({'.unlock': 'none', '.settingMenu': 'block'});
}

document.getElementById('lockBtn').addEventListener('click', unlockFunc);
document.getElementById('mayday').addEventListener('click', lockFunc);
document.getElementById('settingBtn').addEventListener('click', settingFunc);
