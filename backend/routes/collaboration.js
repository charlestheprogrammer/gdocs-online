function setCursorPosition(ws, message, identifiedUsers) {
    Object.keys(identifiedUsers).forEach((username) => {
        if (identifiedUsers[username].document === message.document && username !== ws.username) {
            identifiedUsers[username].socket.send(JSON.stringify(message));
        }
    });
}

function updateDocument(ws, message, identifiedUsers) {
    Object.keys(identifiedUsers).forEach((username) => {
        if (identifiedUsers[username].document === message.document && username !== ws.username) {
            identifiedUsers[username].socket.send(JSON.stringify(message));
        }
    });
}

function switchDocument(ws, message, identifiedUsers) {
    identifiedUsers[message.username] = {
        socket: ws,
        document: message.destination,
    };
    const usersInDocument = [];
    Object.keys(identifiedUsers).forEach((username) => {
        if (identifiedUsers[username].document === message.origin && username !== ws.username) {
            identifiedUsers[username].socket.send(
                JSON.stringify({
                    type: "leaveDocument",
                    username: ws.username,
                    document: message.origin,
                })
            );
        } else if (identifiedUsers[username].document === message.destination && username !== ws.username) {
            identifiedUsers[username].socket.send(
                JSON.stringify({
                    type: "joinDocument",
                    username: ws.username,
                    document: message.destination,
                })
            );
            usersInDocument.push(username);
        }
    });
    ws.send(
        JSON.stringify({
            type: "usersInDocument",
            users: usersInDocument,
        })
    );
}

function disconnect(ws, identifiedUsers) {
    Object.keys(identifiedUsers).forEach((username) => {
        if (username !== ws.username) {
            identifiedUsers[username].socket.send(
                JSON.stringify({
                    type: "leaveDocument",
                    username: ws.username,
                    document: identifiedUsers[username].document,
                })
            );
        }
    });
    delete identifiedUsers[ws.username];
}

function parseMessage(ws, message, clients, identifiedUsers) {
    const messageObject = JSON.parse(message);
    switch (messageObject.type) {
        case "cursorPosition":
            setCursorPosition(ws, messageObject, identifiedUsers);
            break;
        case "updateDocument":
            updateDocument(ws, messageObject, identifiedUsers);
            break;
        case "joinDocument":
            switchDocument(ws, messageObject, identifiedUsers);
            break;
        case "identify":
            ws.username = messageObject.username;
            identifiedUsers[messageObject.username] = {
                socket: ws,
            };
            break;
        default:
            break;
    }
}

module.exports = {
    parseMessage,
    disconnect,
};
