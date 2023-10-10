let fontList = ["Arial", "Verdana", "Times New Roman", "Garamond", "Georgia", "Courier New", "cursive"];
const user_colors = [
    "#ffc8dd",
    "#d4a373",
    "#caffbf",
    "#a0c4ff",
    "#f08080",
    "#bee1e6",
    "#70d6ff",
    "#ff9770",
    "#84dcc6",
    "#ee6055",
    "#809bce",
    "#7161ef",
];
let document_content = "";
let document_content_element = document.getElementById("page-content");
let document_version_panel = document.getElementById("change-list");
let optionsButtons = document.querySelectorAll(".option-button");
let fontSizeRef = document.getElementById("fontSize");
let advancedOptionButton = document.querySelectorAll(".adv-option-button");
let colorsOptionButton = document.querySelectorAll(".colors-option-button");
const imageInput = document.getElementById("import_image");
const changeHistory = document.getElementById("change_history");
const toggleHistory = document.getElementById("toggle_history");

let saveButton = document.getElementById("save");
let openButton = document.getElementById("open");
let newButton = document.getElementById("new");
const options = {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
};

const modifyText = (command, defaultUi, value) => {
    document.execCommand(command, defaultUi, value);
};

fontList.map((value) => {
    let option = document.createElement("option");
    option.value = value;
    option.innerHTML = value;
    fontName.appendChild(option);
});

for (let i = 1; i <= 7; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = i;
    fontSizeRef.appendChild(option);
}

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        const resizeableImage = document.createElement("div");
        resizeableImage.classList.add("resizeable_div");
        const img = new Image();
        fetch("http://localhost:3000/images/upload", {
            method: "POST",
            body: JSON.stringify({
                base64Image: reader.result,
            }),
            headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("token"),
            },
        })
            .then((res) => {
                res.json().then((body) => {
                    setTimeout(() => {
                        img.src = body.image;
                        resizeableImage.appendChild(img);
                        resizeableImage.contentEditable = false;
                        document_content_element.appendChild(resizeableImage);
                        document_content_element.appendChild(document.createElement("br"));
                        saveDocumentOnTyping();
                    }, 700);
                });
            })
            .catch((err) => {
                console.log(err);
            });
    });
    reader.readAsDataURL(file);
});

optionsButtons.forEach((button) => {
    button.addEventListener("click", () => {
        modifyText(button.id, false, null);
    });
});

advancedOptionButton.forEach((button) => {
    button.addEventListener("change", () => {
        modifyText(button.id, false, button.value);
    });
});

colorsOptionButton.forEach((button) => {
    button.addEventListener("input", () => {
        modifyText(button.id, false, button.value);
    });
});

const saveButtonFunction = async () => {
    const responseAsync = fetch("http://localhost:3000/save", {
        body: JSON.stringify({
            id: localStorage.getItem("idDocument"),
            title: document_title,
            content: document_content_element.innerHTML,
        }),
        method: "POST",
        headers: { "Content-Type": "application/json", token: localStorage.getItem("token") },
    });
    document.getElementById("temp_info").innerHTML = "Enregistrement...";
    const response = await responseAsync;
    const body = await response.json();
    localStorage.setItem("idDocument", body.document._id);
    setTimeout(() => {
        document.getElementById("temp_info").innerHTML = "Enregistré !";
    }, 600);
    localStorage.setItem("currentContent", document_content_element.innerHTML);
    setTimeout(() => {
        document.getElementById("temp_info").innerHTML = "";
    }, 2000);
};

saveButton.addEventListener("click", saveButtonFunction);

openButton.addEventListener("click", () => {
    fetch("http://localhost:3000/api/documents")
        .then((res) => {
            res.json().then((body) => {
                let openModal = document.querySelector(".openModal");
                openModal.style.display = "flex";
                let availableFiles = document.getElementById("availableFiles");
                availableFiles.innerHTML = "";
                body.forEach((doc) => {
                    let li = document.createElement("li");
                    li.innerHTML = doc.title;
                    li.addEventListener("click", () => {
                        openFile(doc._id);
                        let openModal = document.querySelector(".openModal");
                        openModal.style.display = "none";
                    });
                    availableFiles.appendChild(li);
                });
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

async function displayDocumentVersionsonOpen() {
    const changeList = document.getElementById("change-list");
    changeList.innerHTML = ""; // Clear any previous entries

    try {
        const documentId = localStorage.getItem("idDocument");

        if (!documentId) {
            console.error("Document ID is not available in localStorage");
            return;
        }

        const response = await fetch(`http://localhost:3000/getDocumentUpdates/${documentId}`);
        if (response.ok) {
            const versions = await response.json();
            versions.forEach((version) => {
                const versionId = version._id;
                const entry = document.createElement("div");
                entry.classList.add("change_entry");
                entry.innerHTML = `<p>Le ${new Date(version.timestamp).toLocaleString("fr-FR", options)}</p>
                    <p>${version.user.name} : ${version.description ? version.description : "Updated content"}</p>
                `;
                // Display comments if available
                if (version.comments && version.comments.length > 0) {
                    const commentsDiv = document.createElement("div");
                    commentsDiv.classList.add("comments");

                    version.comments.forEach((comment) => {
                        const commentDiv = document.createElement("div");
                        commentDiv.classList.add("comment-display");
                        commentDiv.innerHTML = `
                            <p class="comment-user">${comment.user}</p>
                            <p class="comment-timestamp">${new Date(comment.timestamp).toLocaleString(
                                "fr-FR",
                                options
                            )}</p>
                            <p class="comment-text">${comment.content}</p>
                        `;
                        commentsDiv.appendChild(commentDiv);
                        entry.appendChild(commentsDiv);
                    });

                    entry.appendChild(commentsDiv);
                }
                changeList.appendChild(entry);

                if (versionId !== null) {
                    entry.dataset.versionId = versionId;
                    const rollbackButton = document.createElement("button");
                    rollbackButton.innerText = "Rollback";
                    rollbackButton.classList.add("rollback-button");

                    // Creating the comment div
                    const commentDiv = document.createElement("div");
                    commentDiv.classList.add("comment-div");
                    const commentTextarea = document.createElement("textarea");
                    commentTextarea.classList.add("comment-input");
                    commentTextarea.placeholder = "Commentaire";
                    commentDiv.id = "comment-div-" + versionId;
                    commentDiv.appendChild(commentTextarea);
                    const commentButton = document.createElement("button");
                    commentButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
                    commentButton.classList.add("comment-button");
                    commentDiv.appendChild(commentButton);
                    // Ending the creation of the comment div

                    entry.appendChild(commentDiv);
                    commentButton.addEventListener("click", async () => {
                        const comment = commentTextarea.value;
                        const commentResponse = await saveCommentToDatabase(
                            versionId,
                            localStorage.getItem("username"),
                            comment
                        );
                        if (commentResponse._id != null) {
                            commentTextarea.value = "";
                            const commentDisplayDiv = document.createElement("div");
                            commentDisplayDiv.classList.add("comment-display");
                            // Add user information, timestamp, and text to the div
                            commentDisplayDiv.innerHTML = `
                                <p class="comment-user">${commentResponse.user}</p>
                                <p class="comment-timestamp">${new Date(commentResponse.timestamp).toLocaleString(
                                    "fr-FR",
                                    options
                                )}</p>
                                <p class="comment-text">${commentResponse.content}</p>
                            `;
                            // Find the corresponding "change entry" div and append the comment display div to it
                            const versionEntryDiv = document.querySelector(`[data-version-id="${versionId}"]`);
                            if (versionEntryDiv) {
                                const commentDiv = versionEntryDiv.querySelector(".comment-div");
                                if (commentDiv) {
                                    commentDiv.appendChild(commentDisplayDiv);
                                }
                            }
                        }
                    });
                    entry.appendChild(rollbackButton);
                    rollbackButton.addEventListener("click", async () => {
                        // Show a confirmation dialog before performing the rollbac
                        const confirmation = confirm("Are you sure you want to rollback to this version?");
                        if (confirmation) {
                            rollbackToVersion(versionId);
                        }
                    });
                }
            });
        } else {
            console.error("Failed to fetch document versions");
        }
    } catch (error) {
        console.error("Error fetching document versions:", error);
    }
}

function toggleHistoryPannel() {
    changeHistory.classList.toggle("open");
    displayDocumentVersionsonOpen();
}
function rollbackToVersion(versionId) {
    // Make a request to retrieve the specific version content
    fetch(`http://localhost:3000/getUpdate/${versionId}`)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Failed to retrieve version content");
            }
        })
        .then((version) => {
            if (version && version.content) {
                // Update the page content
                document.getElementById("page-content").innerHTML = version.content;

                // Create a new version entry with rollback description
                addToChangeHistory(
                    localStorage.getItem("username"),
                    new Date().toLocaleString("fr-FR", options),
                    new Date().toISOString(),
                    `Rollback to version: ${versionId}`,
                    version.content
                );

                saveButtonFunction();
            }
        })
        .catch((error) => {
            console.error("Error rolling back to version:", error);
        });
}

function openFile(document_id) {
    fetch(`http://localhost:3000/openFile/${document_id}`, {
        headers: {
            Authorization: localStorage.getItem("token"),
        },
    })
        .then((res) => {
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    document.getElementById("unauthorizedModal").style.display = "flex";
                    return;
                } else {
                    document.getElementById("unreachableModal").style.display = "flex";
                }
                return;
            }
            res.json().then((data) => {
                document_title = data.document.title;
                document_content_element.innerHTML = data.content;
                localStorage.setItem("currentContent", document_content_element.innerHTML);
                const origin =
                    localStorage.getItem("idDocument") == document_id ? null : localStorage.getItem("idDocument");
                localStorage.setItem("idDocument", document_id);
                socket.send(
                    JSON.stringify({
                        type: "joinDocument",
                        token: localStorage.getItem("token"),
                        origin: origin,
                        destination: document_id,
                    })
                );
                updateTitle();
                document.querySelector(".users_cursors").innerHTML = "";
                document.querySelectorAll(".connected_user").forEach((user) => {
                    user.remove();
                });
                document.getElementById("unauthorizedModal").style.display = "none";
            });
        })
        .catch((err) => {
            document.getElementById("unreachableModal").style.display = "flex";
        });
}

function attachRollbackListener() {
    const rollbackButtons = document.querySelectorAll(".rollback-button");
    rollbackButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const versionId = button.parentElement.dataset.versionId;
            // Show a confirmation dialog before performing the rollback
            const confirmation = confirm("Are you sure you want to rollback to this version?");
            if (confirmation) {
                rollbackToVersion(versionId);
            }
        });
    });
}

async function attachCommentListener() {
    const commentButtons = document.querySelectorAll(".comment-button");
    commentButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const commentTextarea = button.parentElement.querySelector(".comment-input");
            const comment = commentTextarea.value;
            const versionId = button.parentElement.parentElement.dataset.versionId;
            const user = localStorage.getItem("username");
            try {
                const [commentId, version] = await saveCommentToDatabase(versionId, user, comment);
                if (commentId != null) {
                    commentTextarea.value = "";
                    const commentDisplayDiv = document.createElement("div");
                    commentDisplayDiv.classList.add("comment-display");
                    // Add user information, timestamp, and text to the div
                    commentDisplayDiv.innerHTML = `
                        <p class="comment-user">${user}</p>
                        <p class="comment-timestamp">${new Date().toLocaleString("fr-FR", options)}</p>
                        <p class="comment-text">${comment}</p>
                    `;
                    // Find the corresponding "change entry" div and append the comment display div to it
                    const versionEntryDiv = document.querySelector(`[data-version-id="${versionId}"]`);
                    if (versionEntryDiv) {
                        const commentDiv = versionEntryDiv.querySelector(".comment-div");
                        if (commentDiv) {
                            commentDiv.appendChild(commentDisplayDiv);
                        }
                    }
                }
            } catch (error) {
                console.error("Error saving comment:", error);
                // Handle the error as needed
            }
        });
    });
}

const newDocumentFunction = async () => {
    document_title = "Nouveau document";
    document_content_element.innerHTML = "";
    const origin = localStorage.getItem("idDocument");
    updateTitle();
    document.querySelector(".users_cursors").innerHTML = "";
    document.querySelectorAll(".connected_user").forEach((user) => {
        user.remove();
    });
    await saveButtonFunction();
    localStorage.setItem("currentContent", document_content_element.innerHTML);
    socket.send(
        JSON.stringify({
            type: "joinDocument",
            token: localStorage.getItem("token"),
            origin: origin,
            destination: localStorage.getItem("idDocument"),
        })
    );
};

newButton.addEventListener("click", newDocumentFunction);

document.getElementById("document_title").addEventListener("input", () => {
    document_title = document.getElementById("document_title").value;
    document.title = document_title + " - Cheetah Docs";
});
