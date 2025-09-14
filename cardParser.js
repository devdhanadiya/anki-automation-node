const fs = require("fs");
const path = require("path")

const rawCards = fs.readFileSync(path.join(__dirname, 'cardData.txt'), 'utf-8');

function parseCards(rawText) {
    const cardChunks = rawText.split(/Card \d+\s*/).filter(Boolean);

    return cardChunks.map(chunk => {
        const frontMatch = chunk.match(/Front:\s*([\s\S]*?)\nBack:/);
        const backMatch = chunk.match(/Back:\s*([\s\S]*)/);

        return {
            front: frontMatch ? frontMatch[1].trim() : "",
            back: backMatch ? backMatch[1].trim() : ""
        };
    });
}

module.exports = { rawCards, parseCards };
