document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:3000/api/documents")
    .then((res) => {
      res.json().then((body) => {
        let filesModal = document.querySelector(".filesModal");
        filesModal.style.display = "flex";
        let homePageFiles = document.getElementById("homePageFiles");
        homePageFiles.innerHTML = "";
        body.forEach((doc) => {
          let listItem = document.createElement("li");

          let documentInfo = document.createElement("div");
          documentInfo.classList.add("document-info");

          let title = document.createElement("h2");
          title.textContent = doc.title;

          let lastModified = document.createElement("p");
          lastModified.textContent = `Dernière modification : 21 septembre 2023`;

          let image = document.createElement("img");
          image.src = "./assets/gdocs.png";
          image.classList.add("image-style");

          documentInfo.appendChild(image);
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