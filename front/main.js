
var selectElement = document.getElementById("lang");
let socketClient = new WebSocket('wss://40sykmtv5d.execute-api.us-east-1.amazonaws.com/dev?channel=123456&lang=en');
selectElement.addEventListener('change', (event) => {
    const url = 'wss://40sykmtv5d.execute-api.us-east-1.amazonaws.com/dev?channel=123456&lang=' + event.target.value;
    if (socketClient){
        socketClient.close()
    }
    socketClient = new WebSocket(url)
    socketClient.onmessage = (message) => {
        console.log(message)
        const chatRoom = document.querySelector('#chat-room')
        const data = JSON.parse(message.data)
        chatRoom.innerText = chatRoom.innerText + '\n' + data.message
    }
});

socketClient.onmessage = (message) => {
    console.log(message)
    const chatRoom = document.querySelector('#chat-room')
    const data = JSON.parse(message.data)
    chatRoom.innerText = chatRoom.innerText + '\n' + data.message
}

const form = document.getElementById('send')
form.onsubmit = (ev) => {
    ev.preventDefault()
    const input = document.getElementById('text')
    const text = input.value
    console.log(text)
    const message = {
        action: "message",
        channel: "123456",
        data: { message: text }
    }
    socketClient.send(JSON.stringify(message))
    return false
}



