describe("get /:idDocument", () => {
    it("should create then open document", async () => {
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
        const response = await fetch(`http://localhost:3080/openFile/${body.document._id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "test-default",
            },
        });

        const newBody = await response.json();
        expect(response.status).toBe(200);
        expect(newBody.document.title).toBe("Test document");
        const response2 = await fetch(`http://localhost:3080/openFile/${body.document._id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "test-2",
            },
        });
        expect(response2.status).toBe(403);
    });
});
