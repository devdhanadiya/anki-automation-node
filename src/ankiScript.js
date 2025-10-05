const fetch = require("node-fetch");
const { rawCards, parseCards } = require("./cardParser");

const ANKI_URL = "http://172.27.160.1:8765";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

// Simple delay function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Recurssive fetch 
async function fetchWithRetry(payload, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(ANKI_URL, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }
            return data;
        } catch (err) {
            if (attempt === retries) {
                throw new Error(`Failed after ${retries} attempts: ${err.message}`);
            }
            console.warn(`Attempt ${attempt} failed: ${err.message}. Retrying in ${RETRY_DELAY}ms...`);
            await sleep(RETRY_DELAY);
        }
    }
}

// Acummulates the existing deck names
async function getDeckNames() {
    const payload = { action: "deckNames", version: 6 };
    try {
        const data = await fetchWithRetry(payload);
        return data.result || [];
    } catch (err) {
        console.error("Error fetching deck names:", err);
        return [];
    }
}

// Deck creator
async function createDeck(deckName) {
    const payload = {
        action: "createDeck",
        version: 6,
        params: { deck: deckName }
    };
    try {
        const data = await fetchWithRetry(payload);
        console.log(`Created deck: "${deckName}" →`, data);
        return true;
    } catch (err) {
        console.error(`Error creating deck "${deckName}":`, err);
        return false;
    }
}

// Card adder fucntion
async function addCard(front, back, deckName) {
    const payload = {
        action: "addNote",
        version: 6,
        params: {
            note: {
                deckName: deckName,
                modelName: "Basic",
                fields: { Front: front, Back: back },
                options: { allowDuplicate: true },
                tags: ["auto-added"]
            }
        }
    };

    try {
        const data = await fetchWithRetry(payload);
        console.log(`Added card: "${front}" to "${deckName}" →`, data);
    } catch (err) {
        console.error(`Error adding card "${front}" to "${deckName}":`, err);
    }
}

// Main function
async function main() {
    const { topic, cards } = parseCards(rawCards);
    const month = "February"; // Change month as needed
    const categoryDeckName = "IOL"

    // Full deck name with hierarchy
    // Note "::" is used to denote sub-decks in Anki
    const DECK_NAME = `${categoryDeckName}::${month}::${topic}`;

    console.log(`Using deck name: "${DECK_NAME}"`);

    // Checks if deck exists, if not creates one with the given deck name
    let existingDecks = await getDeckNames();
    if (!existingDecks.includes(DECK_NAME)) {
        const created = await createDeck(DECK_NAME);
        if (!created) {
            console.error(`Failed to create deck "${DECK_NAME}". Aborting.`);
            return;
        }
        // Verifies deck creation
        existingDecks = await getDeckNames();
        if (!existingDecks.includes(DECK_NAME)) {
            console.error(`Deck "${DECK_NAME}" still not found after creation attempt. Aborting.`);
            return;
        }
        console.log(`Deck "${DECK_NAME}" confirmed to exist.`);
    } else {
        console.log(`Deck "${DECK_NAME}" already exists.`);
    }

    // Add cards to the deck
    for (let { front, back } of cards) {
        await addCard(front, back, DECK_NAME);
        await sleep(400); // Small delay to avoid socket hangup
    }

    console.log("Script completed.");
}

main().catch(err => console.error("Main function error:", err));

// I recommend you to use logs for verification and debugging.
