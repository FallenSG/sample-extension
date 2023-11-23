class edit{

    #editFunc = {
        origFrame: "",
        fetchedList: [],

        init: () => {
            this.#editFunc.fetchedList = []
            chrome.runtime.sendMessage({ fn: 'getStatus' }, (resp) => {
                // if(response.status === 401){}
                // else if(response.status === 200){
                this.#editFunc.displaySetter(resp.keyVal);
                // }
            });
        },

        displaySetter: (keyVal) => {
            var cont = document.getElementById('editCont');
            if(!keyVal.length)
                return cont.innerHTML = "No Saved Window Exists!!"
           
            cont.innerHTML = '<table id="editTable"></table>';
            let table = document.getElementById('editTable');

            table.innerHTML = '<tr><th>Title</th> <th>Operation</th></tr> <br/>'

            keyVal.forEach((val) => {
                table.innerHTML += `<tr id="${val}-tr"> \
                    <td> <input id="${val}" class="regularInput" value=${val}> </td> \
                    <td> <button id="${val}-open" class="icon-button">\
                            <span id="${val}-open" class="down-arrow"></span>
                        </button> \  
                        <button id="${val}-delete" click=>Delete</button> \
                    </td> </tr> <div id="${val}-div"></div>`
            })
        },

        close: () => {
            var msg = JSON.stringify({
                'frameId': this.#editFunc.origFrame,
            })

            window.parent.postMessage(msg, "*");
        },

        save: () => {
            //unknown object is showing
            //after a round of saving when further updating is done on that parent error.
            var keyVal = { };
            var updLink = { }
            var values = document.querySelectorAll('.regularInput');

            values.forEach((val) => {
                let id = val.id;
                if(id !== val.value && val.value !== "")
                    keyVal[id] = val.value;

                let table = document.getElementById(`${id}-div`).children.editTable;
                if(table){
                    let rows = table.querySelectorAll('tr');

                    for(let i=0;i<rows.length;i++){
                        const firstCell = rows[i].querySelectorAll('td')[0].children[0];
                        let inpVal = firstCell.value;

                        if(firstCell.name !== inpVal && inpVal !== ""){
                            if(!updLink[id]){
                                updLink[id] = { }
                            }

                            updLink[id][firstCell.id] = inpVal;
                        }
                    }
                }
                
            })

            chrome.runtime.sendMessage( { fn: "renameLinks", 'keyVal': keyVal, 'updLink': updLink}, (resp) => {
                if(resp.status === 200)
                    this.#editFunc.init()
            });
        },

        delete: (name) => {
            let conf = confirm("All of the Links will be deleted.\nDo you wish to continue?")
            if(conf){
                chrome.runtime.sendMessage({ fn: "deleteWindow", keyVal: [ name ] }, (resp) => {
                    if(resp.status === 200){
                        document.getElementById(`${name}-tr`).innerHTML = "";
                        document.getElementById(`${name}-div`).innerHTML = "";
                    }
                })
            }
        },

        delLink: (id) => {
            let conf = confirm("Are You sure \nDo you wish to continue?");
            if(conf){
                chrome.runtime.sendMessage({ fn: "delLink", data: id }, (resp) => {
                    if(resp.status === 200)
                        this.#editFunc.init();
                })
            }
        },

        open: (name) => {
            document.getElementById(`${name}-open`).classList.toggle("active");
            let cont = document.getElementById(`${name}-div`)

            if(cont.style.display === "block")
                return cont.style.display = "none";
            

            else if(this.#editFunc.fetchedList.includes(name)){
                return cont.style.display = "block";
            }

            chrome.runtime.sendMessage({ fn: "getWindowLinks", windowKeyVal: name }, (resp) => {
                cont.style.display = "block"
                this.#editFunc.fetchedList.push(name); //prevents re-fetching of the window links.

                if(resp.status === 404)
                    cont.innerHTML = "Empty!!";
                
                else{         
                    let table = document.createElement('table');
                    table.id = "editTable"    
                    
                    for (let key in resp.reqLink){
                        let row = document.createElement('tr');
                        let cell1 = document.createElement('td');
                        let cell2 = document.createElement('td');

                        cell1.innerHTML = `<input id="${key}" name="${resp.reqLink[key][0]}" value="${resp.reqLink[key][0]}" />`
                        cell2.innerHTML = `<button id="${name}_${key}-delLink">Delete</button>`

                        row.append(cell1);
                        row.append(cell2);

                        table.append(row);
                    }

                    cont.append(table);
                }
            })
        }
    }

    constructor(){
        document.addEventListener('click', (event) => {
            let btnId = event.target.id;
            if(btnId in this.#editFunc)
                this.#editFunc[btnId]();
            else{
                let arr = btnId.split('-');
                if(arr[1] in this.#editFunc)
                    this.#editFunc[arr[1]](arr[0])
            }
            
        })

        window.addEventListener('message', (resp) => {
            let data = JSON.parse(resp.data);
            this.#editFunc.origFrame = data.origFrame;
        });

        this.#editFunc.init();

    }
}

new edit();