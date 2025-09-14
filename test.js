const fetch = require("node-fetch");

const ANKI_URL = "http://172.27.160.1:8765"; // Windows host IP for WSL

async function test() {
    try {
        const res = await fetch(ANKI_URL, {
            method: "POST",
            body: JSON.stringify({ action: "version", version: 6 }),
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        console.log("Connected! AnkiConnect version:", data.result);
    } catch (err) {
        console.error("Connection failed:", err);
    }
}

test();
