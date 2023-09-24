document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:3000/api/documents")
    .then((res) => {
      res.json().then((body) => {
        let filesModal = document.querySelector(".filesModal");
        filesModal.style.display = "flex";
        let homePageFiles = document.getElementById("homePageFiles");
        homePageFiles.innerHTML = "";
        let documentList = document.createElement("ul");
        documentList.classList.add("document-list");
        body.forEach((doc) => {
          let documentBlock = document.createElement("div");
          documentBlock.classList.add("document-block");
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
          documentBlock.appendChild(documentInfo);
          documentList.appendChild(documentBlock);
          documentBlock.addEventListener("click", () => {
            openFile(doc._id);
            window.location.href = "./document";
          });
          homePageFiles.appendChild(documentList);
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
