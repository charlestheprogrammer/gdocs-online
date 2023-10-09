const { parseMessage, disconnect } = require("../routes/collaboration");

describe("Collaboration logic", () => {
    let identifiedUsers = {};
    let documentId = null;

    beforeAll(async () => {
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
        documentId = body.document._id;
    });

    beforeEach(async () => {
        identifiedUsers = {};
    });

    it("should give rights to user", async () => {
        // Default User connect
        const response = await fetch(`http://localhost:3080/openFile/${documentId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "test-default",
            },
        });
        expect(response.status).toBe(200);

        // Unautorized User connect
        const response2 = await fetch(`http://localhost:3080/openFile/${documentId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "test-default2",
            },
        });
        expect(response2.status).toBe(403);

        // Default User accept read
        // TODO
    });
});
