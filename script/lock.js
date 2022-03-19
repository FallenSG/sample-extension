class lock {
    #resFunc = {

    }

    unlockSeq(){
        document.getElementById('unlockBtn').addEventListener('click', () => {
            var passVal = document.getElementById('lockIn').value;
            document.getElementById('lockIn').value = '';

            chrome.runtime.sendMessage({ fn: 'lockToggler', reqType: 'unlock', pass: passVal }, function (response) {
                if (response.status === 200) {
                    var message = JSON.stringify({
                        'frameId': 'privMode',
                        'origFrame': ''
                        //,
                    });

                    window.parent.postMessage(message, '*');
                }
                else {
                    document.getElementById('lockMsg').innerHTML = "Wrong Password";
                }
            });
        });
    }

    keyPress(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            this.unlockSeq();
        }
    }
    
    constructor() {
        
        this.unlockSeq();

        document.getElementById('pubMode').addEventListener('click', (event) => {
            var message = JSON.stringify({
                'frameId': event.target.id,
                'origFrame': ''
                //,
            });
            window.parent.postMessage(message, '*');
        });

        document.getElementById('lockIn').addEventListener('keydown', this.keyPress)
    }
}

var obj = new lock();