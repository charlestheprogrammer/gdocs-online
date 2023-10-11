const page_holder = document.getElementById("page_holder");
const WS_URL = "ws://csimonmeunier.me:3000/collaboration";
let connected = false;

page_holder.addEventListener("mousemove", function (event) {
    if (!connected) return;
    const pageSize = {
        width: page_holder.offsetWidth,
        height: page_holder.offsetHeight,
    };
    var rect = page_holder.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    cursor_pos = {
        x: x / pageSize.width,
        y: y / pageSize.height,
    };
    socket.send(
        JSON.stringify({
            type: "cursorPosition",
            username: localStorage.getItem("userId"),
            name: localStorage.getItem("username"),
            document: localStorage.getItem("idDocument"),
            image_url: localStorage.getItem("image"),
            data: {
                x: x / pageSize.width,
                y: y / pageSize.height,
            },
        })
    );
});

function manageNewCursorPosition(data) {
    if (document.getElementById("cursor_" + data.username) == null) {
        console.log(data);
        let cursor = document.createElement("div");
        cursor.classList.add("cursor");
        cursor.id = "cursor_" + data.username;
        let p = document.createElement("p");
        p.innerHTML = data.name.split(" ")[0];
        cursor.appendChild(p);
        document.querySelector(".users_cursors").appendChild(cursor);
        cursor.style.backgroundColor = user_colors[document.querySelector(".users_cursors").children.length - 1];
        cursor.style.background = "url(" + data.image_url + ") center center / cover no-repeat";
        p.style.color = cursor.style.backgroundColor;
    }
    const cursor = document.getElementById("cursor_" + data.username);
    cursor.style.left = data.data.x * 100 + "%";
    cursor.style.top = data.data.y * 100 + "%";
}

const connected_users = document.getElementById("connected_users");

function userLeave(data) {
    const cursor = document.getElementById("cursor_" + data.username);
    const user_info = document.getElementById("connected_users_" + data.username);
    if (user_info != null) connected_users.removeChild(user_info);
    cursor?.remove();
}

function userJoin(data) {
    const userInfo = document.createElement("div");
    userInfo.id = "connected_users_" + data.username;
    userInfo.classList.add("connected_user");
    const userImage = document.createElement("img");
    userImage.src = data.user.image_url;
    const userName = document.createElement("p");
    userName.innerHTML = data.user.name.split(" ")[0];
    userInfo.appendChild(userImage);
    userInfo.appendChild(userName);
    connected_users.appendChild(userInfo);
}

let socket;

function initSocket() {
    socket = new WebSocket(WS_URL);
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type !== "cursorPosition") {
            console.log(data);
        }
        if (data.username == localStorage.getItem("userId")) return;
        // if (data.document != localStorage.getItem("idDocument")) return;
        if (data.type == "cursorPosition") {
            if (data.document != localStorage.getItem("idDocument")) return;
            manageNewCursorPosition(data);
        } else if (data.type == "updateDocument") {
            if (data.document != localStorage.getItem("idDocument")) return;
            document_content_element.innerHTML = data.content;
        } else if (data.type == "leaveDocument") {
            userLeave(data);
        } else if (data.type == "joinDocument") {
            if (data.document != localStorage.getItem("idDocument")) return;
            userJoin(data);
        } else if (data.type == "usersInDocument") {
            data.users.forEach((user) => {
                userJoin(user);
            });
        } else if (data.type == "requestRead") {
            if (window.confirm(`Donnez à ${data.user.name} le droit de lire le document ${data.document} ?`)) {
                socket.send(
                    JSON.stringify({
                        type: "acceptRead",
                        username: data.user.name,
                        document: data.document,
                        user: data.user,
                        token: localStorage.getItem("token"),
                        email: localStorage.getItem("email"),
                    })
                );
            }
        } else if (data.type == "acceptRead") {
            openFile(data.document);
        } else if (data.type == "requestWrite") {
            if (window.confirm(`Donnez à ${data.user.name} le droit d'écrire dans le document ${data.document} ?`)) {
                socket.send(
                    JSON.stringify({
                        type: "acceptWrite",
                        username: data.user.name,
                        document: data.document,
                        user: data.user,
                        token: localStorage.getItem("token"),
                        email: localStorage.getItem("email"),
                    })
                );
            }
        } else if (data.type == "acceptWrite") {
            document_content_element.contentEditable = true;
        } else if (data.type == "cantWrite") {
            document_content_element.contentEditable = false;
            document_content_element.addEventListener("click", () => {
                socket.send(
                    JSON.stringify({
                        type: "updateDocument",
                        token: localStorage.getItem("token"),
                        email: localStorage.getItem("email"),
                        document: localStorage.getItem("idDocument"),
                        content: document_content_element.innerHTML,
                    })
                );
            });
            alert("You can't write");
        } else if (data.type == "documentFull") {
            alert("This document is full");
            if (localStorage.getItem("idDocument") == data.document) {
                window.location.href = "../";
            }
        }
    };

    socket.onopen = () => {
        connected = true;
        socket.send(
            JSON.stringify({
                type: "identify",
                token: localStorage.getItem("token"),
                email: localStorage.getItem("email"),
            })
        );
        if (localStorage.getItem("idDocument") != null) {
            openFile(localStorage.getItem("idDocument"));
        }
        updateTitle();
    };

    socket.onclose = () => {
        console.log("Socket closed");
        connected = false;
    };
}
