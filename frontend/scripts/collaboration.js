const page_holder = document.getElementById("page_holder");

page_holder.addEventListener("mousemove", function (event) {
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
      username: localStorage.getItem("username"),
      document: localStorage.getItem("idDocument"),
      data: {
        x: x / pageSize.width,
        y: y / pageSize.height,
      },
    })
  );
});

function manageNewCursorPosition(data) {
  if (document.getElementById("cursor_" + data.username) == null) {
    let cursor = document.createElement("div");
    cursor.classList.add("cursor");
    cursor.id = "cursor_" + data.username;
    let p = document.createElement("p");
    p.innerHTML = data.username;
    cursor.appendChild(p);
    document.querySelector(".users_cursors").appendChild(cursor);
    cursor.style.backgroundColor =
      user_colors[
        Math.floor(Math.random() * (user_colors.length - 1 - 0 + 1)) + 0
      ];
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
  userImage.src = "./assets/csimonmeunier.png";
  const userName = document.createElement("p");
  userName.innerHTML = data.username;
  userInfo.appendChild(userImage);
  userInfo.appendChild(userName);
  connected_users.appendChild(userInfo);
}

const socket = new WebSocket("ws://localhost:3001");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.username == localStorage.getItem("username")) return;
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
      userJoin({
        username: user,
      });
    });
  }
};

socket.onopen = () => {
  socket.send(
    JSON.stringify({
      type: "identify",
      username: localStorage.getItem("username"),
    })
  );
};
