const ChainOfResponsabilitySchema = require("../schemas/chainOfResponsability");
const UserResponsabilitySchema = require("../schemas/userResponsability");
const UserSchema = require("../schemas/user");

const { userWantToWrite } = require("../misc/chainOfResponsability");
const { getAuthenticatedUser } = require("../authentification");

function setCursorPosition(ws, message, identifiedUsers) {
    Object.keys(identifiedUsers).forEach((username) => {
        if (identifiedUsers[username].document === message.document && username !== ws.username) {
            identifiedUsers[username].socket.send(JSON.stringify(message));
        }
    });
}

async function updateDocument(ws, message, identifiedUsers, user) {
    const userResponsability = await UserResponsabilitySchema.findOne({
        user: user._id,
        document: message.document,
    }).exec();
    if (!userResponsability || !userResponsability.writePermission) {
        const allowedUsers = await userWantToWrite(message.document);
        ws.send(
            JSON.stringify({
                type: "cantWrite",
                document: message.document,
            })
        );
        if (allowedUsers) {
            for (const allowedUser of allowedUsers) {
                if (!allowedUser.user) {
                    continue;
                }
                identifiedUsers[allowedUser.user._id.toString()]?.socket.send(
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

async function switchDocument(ws, message, identifiedUsers, user) {
    const connectedUsersOnDocument = [];
    Object.keys(identifiedUsers).forEach((username) => {
        if (identifiedUsers[username].document === message.destination && username !== ws.username) {
            connectedUsersOnDocument.push(username);
        }
    });
    if (connectedUsersOnDocument.length >= 10) {
        ws.send(
            JSON.stringify({
                type: "documentFull",
                document: message.destination,
            })
        );
        return;
    }
    identifiedUsers[user._id.toString()] = {
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
                    user: user,
                })
            );
        } else if (identifiedUsers[username].document === message.destination && username !== ws.username) {
            identifiedUsers[username].socket.send(
                JSON.stringify({
                    type: "joinDocument",
                    username: ws.username,
                    document: message.destination,
                    user: user,
                })
            );
            usersInDocument.push({
                username: username,
            });
        }
    });
    for (let i = 0; i < usersInDocument.length; i++) {
        const user = await UserSchema.findById(usersInDocument[i].username).exec();
        usersInDocument[i].user = user;
    }
    ws.send(
        JSON.stringify({
            type: "usersInDocument",
            users: usersInDocument,
        })
    );
}

function disconnect(ws, identifiedUsers) {
    Object.keys(identifiedUsers).forEach((username) => {
        if (ws.username !== username) {
            identifiedUsers[username].socket.send(
                JSON.stringify({
                    type: "leaveDocument",
                    username: ws.username,
                    document: identifiedUsers[username].document,
                })
            );
        }
    });
    delete identifiedUsers[ws.username?.toString()];
}

async function acceptRead(ws, message, identifiedUsers) {
    const user = await UserSchema.findById(message.user._id).exec();
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
    identifiedUsers[message.user._id].socket.send(
        JSON.stringify({
            type: "acceptRead",
            document: message.document,
        })
    );
}

async function acceptWrite(ws, message, identifiedUsers) {
    const user = await UserSchema.findById(message.user._id).exec();
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
    identifiedUsers[message.user._id].socket.send(
        JSON.stringify({
            type: "acceptWrite",
            document: message.document,
        })
    );
}

async function parseMessage(ws, message, clients, identifiedUsers) {
    const messageObject = JSON.parse(message);
    let user = null;
    if (messageObject.type !== "cursorPosition") {
        user = await getAuthenticatedUser(
            {
                email: messageObject.email,
                password: messageObject.token,
            },
            true
        );
        if (user == null) return;
        messageObject.username = user._id.toString();
    }
    switch (messageObject.type) {
        case "cursorPosition":
            setCursorPosition(ws, messageObject, identifiedUsers);
            break;
        case "updateDocument":
            updateDocument(ws, messageObject, identifiedUsers, user);
            break;
        case "joinDocument":
            switchDocument(ws, messageObject, identifiedUsers, user);
            break;
        case "leaveDocument":
            disconnect(ws, identifiedUsers);
            break;
        case "identify":
            ws.username = user._id.toString();
            identifiedUsers[user._id.toString()] = {
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
