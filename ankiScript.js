// ankiScript.js
const fetch = require("node-fetch");
const { rawCards, parseCards } = require("./cardParser");

const ANKI_URL = "http://172.27.160.1:8765";
const TopicName = {
    tname: `
            1
        `}
const DECK_NAME = `Polity & Governance::January::${TopicName.tname}`;

// Simple delay helper
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Add single card to Anki
async function addCard(front, back) {
    const payload = {
        action: "addNote",
        version: 6,
        params: {
            note: {
                deckName: DECK_NAME,
                modelName: "Basic",
                fields: { Front: front, Back: back },
                options: { allowDuplicate: true },
                tags: ["auto-added"]
            }
        }
    };

    try {
        const res = await fetch(ANKI_URL, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();
        console.log(`Added card: "${front}" →`, data);
    } catch (err) {
        console.error("Error adding card:", err);
    }
}

// Main function
async function main() {
    const cards = parseCards(rawCards);

    for (let { front, back } of cards) {
        await addCard(front, back);
        await sleep(400); // small delay to avoid socket hangup
    }
}

main();
