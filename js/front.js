var config = chrome.extension.getBackgroundPage().config;

function front(){
  var element = document.getElementById('container');
  var links = config.links;

  for( key in links ){
    element.innerHTML += `<button id="${key}"> ${key} </button>`;
    var div = document.createElement('div');
    div.id = `bt-${key}`;

    for( link of links[key] ){
      div.innerHTML += `${link} <br/>`;
    }

    element.append(div);
  }
}

document.addEventListener('DOMContentLoaded', front());
for( const key in config.links ){
  document.getElementById(key).addEventListener('click', () => {
    var divID = document.getElementById(`bt-${key}`);

    if(divID.style.display == "none") divID.style.display = "block";
    else divID.style.display = "none";
  });
}
