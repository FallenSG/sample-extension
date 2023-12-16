function getRandomColor() {
    const contrastColors = [
        '#3498db', // Example color 1
        '#2ecc71', // Example color 2
        '#e74c3c', // Example color 3
        '#9b59b6', // Example color 4
        '#f39c12'  // Example color 5
        // Add more colors as needed
    ];

    const randomIndex = Math.floor(Math.random() * contrastColors.length);
    return contrastColors[randomIndex];
}

var account = {
    init: function(){
        chrome.runtime.sendMessage({ fn: "fetchAcc", origin: "account" }, (resp) => {
            account.displaySetter(resp.acc);
        })
    },

    displaySetter: function(acc){
        const cont = document.getElementsByClassName('circle-container')[0];
        
        for(index in acc){
            const elem = document.createElement('div');
            elem.classList = "circle";
            elem.style.backgroundColor = getRandomColor();
            elem.id = acc[index];

            const span = document.createElement('span')
            span.id = acc[index];
            span.classList = 'letter';
            span.innerText = acc[index];

            elem.append(span);
            cont.append(elem);
        }
    },

    EventHandler: function(event){
        let Acc = event.target.id

        // if(id === "AccAdd")
        chrome.runtime.sendMessage({ fn: "activateAcc", acc: Acc }, (resp) => {
            if(resp.status === 200)
                account.postMsg("pubMode")
        })
    },

    postMsg: function (btnId) {
        var message = JSON.stringify({
            'frameId': btnId,
            'origFrame': ''
            //,
        });
        window.parent.postMessage(message, '*');
    }
}

document.addEventListener('DOMContentLoaded', account.init);
document.addEventListener('click', account.EventHandler);