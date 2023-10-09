describe("POST /save", () => {
    it("should create a new document", async () => {
        const res = await fetch("http://localhost:3080/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "test-default",
            },
            body: JSON.stringify({
                title: "Test document",
                content: "",
            }),
        });
        const body = await res.json();
        console.log(body);
        expect(res.status).toBe(200);
        expect(body.document.title).toBe("Test document");
    });

    it("should update a document", async () => {
        const res = await fetch("http://localhost:3080/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "test-default",
            },
            body: JSON.stringify({
                id: "5f9d9c8d0d3e2b0d2c4a6c8c",
                title: "New Test Title",
                content: "New Content",
            }),
        });
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.document.title).toBe("New Test Title");
    });
});
