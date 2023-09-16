function setCursorPosition(ws, message, clients) {
  clients.forEach((client) => {
    client.send(JSON.stringify(message));
  });
}

function updateDocument(ws, message, clients) {
    clients.forEach((client) => {
        client.send(JSON.stringify(message));
    });
}

function parseMessage(ws, message, clients) {
  const messageObject = JSON.parse(message);
  switch (messageObject.type) {
    case "cursorPosition":
      setCursorPosition(ws, messageObject, clients);
      break;
    case "updateDocument":
        updateDocument(ws, messageObject, clients);
        break;
    default:
      break;
  }
}

module.exports = {
  parseMessage,
};
