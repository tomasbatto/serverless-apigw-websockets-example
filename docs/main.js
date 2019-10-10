


const search = window.location.search.substring(1).split('=')
const url = window.location.href.split('?')[0]
let channel = Math.floor(Math.random() * 10000, 10)
if(search.length) { 
   search.forEach((s, i) => {
       console.log(s, i, i%2)
       if(!(i%2)) {
            if (s === 'channel' && search[i+1]) {
                channel = search[i+1] || channel
            }
       }
   }) 
}
window.history.replaceState( {} , 'Live Chat Translation',  url + `?channel=${channel}`);

const websocketUrl = `wss://40sykmtv5d.execute-api.us-east-1.amazonaws.com/dev?channel=${channel}&lang=`
let socketClient = new WebSocket(`${websocketUrl}en`);

const createNewMessageHtml = (username, message) => {
    var article = document.createElement('article');
    article.classList.add('media')
    article.innerHTML = `
    <div class="media-content">
        <div class="content">
            <p>
                <strong>${username}</strong>
                <br>
                ${message}
                <br>
            </p>
        </div>
    </div>
    `
    var target = document.querySelector('#chat-room')
    target.parentNode.insertBefore( article, target );
}

const onMessage = (message) => {
    const data = JSON.parse(message.data)
    const username = data.username
    createNewMessageHtml(username, data.message)
}

var selectElement = document.getElementById("lang");
selectElement.addEventListener('change', (event) => {
    const url = websocketUrl + event.target.value;
    if (socketClient){
        socketClient.close()
    }
    socketClient = new WebSocket(url)
    socketClient.onmessage = onMessage
});

socketClient.onmessage = onMessage


// Send Message
const form = document.getElementById('send')
form.onsubmit = (ev) => {
    ev.preventDefault()
    const input = document.getElementById('text')
    const nameInput = document.getElementById('name')
    const text = input.value
    const name = nameInput.value
    if(text && text.length > 0) {
        const message = {
            action: "message",
            channel: channel,
            data: { message: text, username: name }
        }
        socketClient.send(JSON.stringify(message))
    }
    return false
}

const nameButton = document.getElementById('name-button')
nameButton.addEventListener('click', (ev)=> {
    const nameInput = document.getElementById('name')
    if(nameInput.value.length) {
        document.getElementById('name').disabled = true
        nameButton.disabled = true
        document.getElementById('send-message').disabled = false
    }
})




