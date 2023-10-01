const ChainOfResponsabilitySchema = require("../schemas/chainOfResponsability");
const UserResponsabilitySchema = require("../schemas/userResponsability");
const UserSchema = require("../schemas/user");

const { userWantToWrite } = require("../misc/chainOfResponsability");

function setCursorPosition(ws, message, identifiedUsers) {
    Object.keys(identifiedUsers).forEach((username) => {
        if (identifiedUsers[username].document === message.document && username !== ws.username) {
            identifiedUsers[username].socket.send(JSON.stringify(message));
        }
    });
}

async function updateDocument(ws, message, identifiedUsers) {
    const user = await UserSchema.findOne({ name: message.username }).exec();
    const userResponsability = await UserResponsabilitySchema.findOne({
        user: user._id,
        document: message.document,
    }).exec();
    if (!userResponsability || !userResponsability.writePermission) {
        const allowedUsers = await userWantToWrite(message.document);
        if (allowedUsers) {
            for (const allowedUser of allowedUsers) {
                if (!allowedUser.user) {
                    continue;
                }
                identifiedUsers[allowedUser.user.name]?.socket.send(
                    JSON.stringify({
                        type: "requestWrite",
                        document: message.document,
                        user: user,
                    })
                );
            }
        }
        return;
    }
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

async function acceptRead(ws, message, identifiedUsers) {
    const user = await UserSchema.findOne({ name: message.username }).exec();
    const userResponsability = await new UserResponsabilitySchema({
        user: user._id,
        document: message.document,
        readPermission: true,
        writePermission: false,
    }).save();
    ChainOfResponsabilitySchema.updateOne(
        { document: message.document },
        {
            $push: {
                chain: userResponsability,
            },
        }
    ).exec();
    identifiedUsers[message.username].socket.send(
        JSON.stringify({
            type: "acceptRead",
            document: message.document,
        })
    );
}

async function acceptWrite(ws, message, identifiedUsers) {
    const user = await UserSchema.findOne({ name: message.username }).exec();
    await UserResponsabilitySchema.updateOne(
        {
            user: user,
            document: message.document,
        },
        {
            $set: {
                writePermission: true,
            },
        }
    ).exec();
    identifiedUsers[message.username].socket.send(
        JSON.stringify({
            type: "acceptWrite",
            document: message.document,
        })
    );
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
        case "leaveDocument":
            disconnect(ws, identifiedUsers);
            break;
        case "identify":
            ws.username = messageObject.username;
            identifiedUsers[messageObject.username] = {
                socket: ws,
            };
            break;
        case "acceptRead":
            acceptRead(ws, messageObject, identifiedUsers);
            break;
        case "acceptWrite":
            acceptWrite(ws, messageObject, identifiedUsers);
            break;
        default:
            break;
    }
}

module.exports = {
    parseMessage,
    disconnect,
};
