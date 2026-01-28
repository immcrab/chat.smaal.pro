import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, off } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhVAzRtPGuaFkhdT0wgvoLSEME7hYxOwY",
  authDomain: "mychatapp-10a99.firebaseapp.com",
  projectId: "mychatapp-10a99",
  storageBucket: "mychatapp-10a99.firebasestorage.app",
  messagingSenderId: "8158664716",
  appId: "1:8158664716:web:8a25281c2a1714ea557629",
  measurementId: "G-XHEXJCSHC2",
  databaseURL: "https://mychatapp-10a99-default-rtdb.firebaseio.com/" 
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const userInp = document.getElementById("usernameInput");
const roomInp = document.getElementById("roomInput");
const chatBox = document.getElementById("chatBox");

userInp.value = localStorage.getItem("chatUser") || "Guest" + Math.floor(Math.random() * 1000);
roomInp.value = localStorage.getItem("chatRoom") || "Lobby";

let currentRoomRef = null;

// Helper to generate a color based on a name
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
    return `hsl(${Math.abs(hash) % 360}, 60%, 35%)`;
}

window.connectToRoom = function() {
    const roomName = roomInp.value.trim() || "Lobby";
    localStorage.setItem("chatRoom", roomName);
    localStorage.setItem("chatUser", userInp.value);

    if (currentRoomRef) off(currentRoomRef); // Kill old listener
    chatBox.innerHTML = "<p style='text-align:center; font-size:12px; opacity:0.5;'>Joined Room: " + roomName + "</p>"; 

    currentRoomRef = ref(db, "rooms/" + roomName);

    onChildAdded(currentRoomRef, (snapshot) => {
        const data = snapshot.val();
        const isMe = data.name === userInp.value;
        const userColor = stringToColor(data.name);
        
        const msgDiv = document.createElement("div");
        msgDiv.className = `msg ${isMe ? 'me' : 'other'}`;
        if (!isMe) msgDiv.style.backgroundColor = userColor;
        
        msgDiv.innerHTML = `
            <b>${isMe ? 'You' : data.name}</b>
            ${data.text}
            <small>${data.time}</small>
        `;
        
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    });
};

window.sendMsg = function() {
    const textInp = document.getElementById("messageInput");
    const name = userInp.value.trim();
    const room = roomInp.value.trim();

    if (textInp.value.trim() !== "" && room !== "") {
        push(ref(db, "rooms/" + room), {
            name: name,
            text: textInp.value,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        textInp.value = "";
    }
};

// Start on load
window.connectToRoom();