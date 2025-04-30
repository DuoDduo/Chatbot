function sendMessage(){
const userMessage = document.querySelector('.chat-window input').value

alert(userMessage);

}
document.querySelector('.chat-window .input-area button').addEventListener("click", ()=> sendMessage())