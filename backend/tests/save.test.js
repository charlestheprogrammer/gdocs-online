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
        expect(res.status).toBe(200);
        expect(body.document.title).toBe("Test document");
    });
});

describe("POST /save", () => {
    it("should create & update a document", async () => {
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
        expect(res.status).toBe(200);
        expect(body.document.title).toBe("Test document");
        const response = await fetch("http://localhost:3080/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "test-default",
            },
            body: JSON.stringify({
                id: body.document._id,
                title: "new title",
                content: "new document content",
            }),
        });
        const newBody = await response.json();
        expect(response.status).toBe(200);
        expect(newBody.document.title).toBe("new title");
    });
});
