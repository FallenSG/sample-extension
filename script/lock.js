class lock {
    #resFunc = {
        postMsg: function(btnId) {
            var message = JSON.stringify({
                'frameId': btnId,
                'origFrame': ''
                //,
            });
            window.parent.postMessage(message, '*');
        },

        unlockSeq: function() {
            var passVal = document.getElementById('lockIn').value;
            document.getElementById('lockIn').value = '';

            chrome.runtime.sendMessage({ fn: 'lockToggler', reqType: 'unlock', pass: passVal },  (response) => {
                if (response.status === 200) {
                    this.postMsg('pubMode')
                }
                else {
                    document.getElementById('lockMsg').innerHTML = "Wrong Password";
                }
            });
        },
    }
    
    constructor() {
        document.addEventListener('click', (PointerEvent) => {
            let fn = PointerEvent.target.id;

            if(fn === "back"){
                chrome.runtime.sendMessage({ fn: 'signOut' }, (resp) => {
                    this.#resFunc.postMsg("account")
                })
            }

            else if(fn === 'unlockBtn')
                this.#resFunc.unlockSeq();
        });

        document.getElementById('lockIn').addEventListener('keydown', (event) => {
            if (event.keyCode === 13) {
                event.preventDefault();
                this.#resFunc.unlockSeq();
            }
        });
    }
}

var obj = new lock();