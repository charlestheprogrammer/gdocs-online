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
                        updateContent();
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

const savButtonFunction = async () => {
    const responseAsync = fetch("http://localhost:3000/save", {
        body: JSON.stringify({
            id: localStorage.getItem("idDocument"),
            title: document_title,
            content: document_content_element.innerHTML,
        }),
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    document.getElementById("temp_info").innerHTML = "Enregistrement...";
    const response = await responseAsync;
    const body = await response.json();
    localStorage.setItem("idDocument", body.document._id);
    setTimeout(() => {
        document.getElementById("temp_info").innerHTML = "Enregistré !";
    }, 600);
    setTimeout(() => {
        document.getElementById("temp_info").innerHTML = "";
    }, 2000);
};

saveButton.addEventListener("click", savButtonFunction);

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

function toggleHistoryPannel() {
    changeHistory.classList.toggle("open");
}

function openFile(document_id) {
    fetch("http://localhost:3000/openFile/" + document_id)
        .then((res) => {
            res.json().then((data) => {
                document_title = data.document.title;
                document_content_element.innerHTML = data.content;
                const origin =
                    localStorage.getItem("idDocument") == document_id ? null : localStorage.getItem("idDocument");
                localStorage.setItem("idDocument", document_id);
                socket.send(
                    JSON.stringify({
                        type: "joinDocument",
                        username: localStorage.getItem("username"),
                        origin: origin,
                        destination: document_id,
                    })
                );
                updateTitle();
                document.querySelector(".users_cursors").innerHTML = "";
                document.querySelectorAll(".connected_user").forEach((user) => {
                    user.remove();
                });
            });
        })
        .catch((err) => {
            console.log(err);
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
    await savButtonFunction();
    socket.send(
        JSON.stringify({
            type: "joinDocument",
            username: localStorage.getItem("username"),
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
