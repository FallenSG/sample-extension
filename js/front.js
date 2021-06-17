
function getStarted(){
    chrome.runtime.sendMessage({fn: "getLinks"}, function(response){
      if(response) displayLinks(response);
      else document.getElementById('container').innerHTML = "Getting Started";
    });
}

function displayLinks(links){
  var element = document.getElementById('container');

  for( key in links ){
    element.innerHTML += `<button id="${key}"> ${key} </button>`;
    var div = document.createElement('div');
    div.id = `bt-${key}`;
    div.style.display = "none";

    for( link in links[key] ){
      div.innerHTML += `${link} <br/>`;
    }

    element.append(div);
  }

  for( const key in links ){
    document.getElementById(key).addEventListener('click', () => {
      var divID = document.getElementById(`bt-${key}`);

      if(divID.style.display == "none") divID.style.display = "block";
      else divID.style.display = "none";
    });
  }
}

document.addEventListener('DOMContentLoaded', getStarted);
