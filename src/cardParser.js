// ChatGPT generated code - use GPT for modification

const fs = require("fs");
const path = require("path");

const rawCards = fs.readFileSync(path.join(__dirname, 'cardData.txt'), 'utf-8');

function parseCards(rawText) {
    //Extract topic with regex that matches "Topic" or "Topic X:" until first "Card" or end
    const topicMatch = rawText.match(/Topic\s*\d*:\s*([\s\S]*?)(?=\nCard|\n*$)/);
    const topic = topicMatch ? topicMatch[1].trim() : "Default Topic";

    if (topic === "Default Topic") {
        console.warn("Warning: No valid topic found in cardData.txt. Using 'Default Topic'. Check format.");
    } else {
        console.log(`Parsed topic: "${topic}"`);
    }

    // Split into card chunks, ignoring topic and empty strings
    const cardChunks = rawText.split(/Card \d+\s*/).filter(chunk => chunk.trim() && !chunk.startsWith("Topic"));

    const cards = cardChunks
        .map((chunk, index) => {
            const frontMatch = chunk.match(/Front:\s*([\s\S]*?)\nBack:/);
            const backMatch = chunk.match(/Back:\s*([\s\S]*)/);

            if (!frontMatch || !backMatch) {
                console.warn(`Warning: Invalid card format in chunk ${index + 1}. Skipping.`);
                return null;
            }

            const front = frontMatch[1].trim();
            const back = backMatch[1].trim();

            if (!front || !back) {
                console.warn(`Warning: Empty front or back in card ${index + 1}. Skipping.`);
                return null;
            }

            return { front, back };
        })
        .filter(card => card !== null); // Remove invalid cards

    console.log(`Parsed ${cards.length} valid cards.`);

    if (cards.length === 0) {
        console.error("Error: No valid cards parsed from cardData.txt.");
    }

    return { topic, cards };
}

module.exports = { rawCards, parseCards };