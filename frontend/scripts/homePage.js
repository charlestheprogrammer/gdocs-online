document.addEventListener("DOMContentLoaded", function () {
    fetch(`${API_URL}/api/documents`)
        .then((res) => {
            res.json().then((body) => {
                let filesModal = document.querySelector(".filesModal");
                let homePageFiles = document.getElementById("homePageFiles");
                homePageFiles.innerHTML = "";
                body.forEach((doc) => {
                    let listItem = document.createElement("div");
                    listItem.classList.add("list-item");

                    let documentInfo = document.createElement("div");
                    documentInfo.classList.add("document-info");

                    let title = document.createElement("h2");
                    title.textContent = doc.title;

                    let lastModified = document.createElement("p");
                    let lastModifiedTime = new Date(doc.lastSave);
                    const options = {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    };
                    lastModified.textContent = `${lastModifiedTime.toLocaleString("fr-FR", options)}`;

                    let imageContainer = document.createElement("div");
                    imageContainer.classList.add("image-container");
                    imageContainer.innerHTML = doc.content;

                    listItem.appendChild(imageContainer);
                    documentInfo.appendChild(title);
                    documentInfo.appendChild(lastModified);

                    listItem.appendChild(documentInfo);
                    listItem.addEventListener("click", () => {
                        openWindowsAndFile(doc._id);
                    });
                    homePageFiles.appendChild(listItem);
                });
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

function openWindowsAndFile(document_id) {
    localStorage.removeItem("idDocument");
    localStorage.setItem("idDocument", document_id);
    window.location.href = "./document/";
}
