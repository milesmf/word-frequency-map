const { readFile, writeFile } = require('fs').promises;

const fileName = process.argv[2];

if (!fileName) throw new Error("PLEASE PROVIDE AN INPUT FILE");
else if (fileName.endsWith('.txt') || fileName.endsWith('.json')) throw new Error("PLEASE DON'T PROVIDE A FILE EXTENSION");
else if (fileName.includes('/')) throw new Error("PLEASE DON'T INCLUDE A PATH, JUST THE FILE NAME");

// HYPHEN -
//EN DASH –
//EM DASH —
// ―

// if (word.includes('-')) console.log(`Hyphenated word: ${word}`);
// if (word.includes('–')) console.log(`En dash word: ${word}`);
// if (word.includes('—')) console.log(`EM dash word: ${word}`);

(async () => {
    try {
        const rawData = (await readFile(`./inputs/${fileName}.txt`, 'utf8')).replace(/[.,":?”“!‘;']|\’|\[|\]|\(|\).*/g, '').split(/[\s]|--/);

        const bannedWords = await readFile('./banned-words.txt', 'utf8');

        //USING new Map()
        await attemptA(rawData, bannedWords);

        //USING [].reduce()
        // await attemptB(rawData, bannedWords);
    } catch (error) {
        console.error(error)
    }
})()

//USING MAP
async function attemptA(rawData, bannedWords) {
    const startTime = performance.now();

    let lastWord = '';
    let lastWordHyphenated = false;

    const wordFrequency = new Map();

    rawData.forEach(word => {
        word = word.toLowerCase();

        if (bannedWords.includes(word)) return;

        //Handle words that are hyphenated
        if (lastWordHyphenated) {
            word = lastWord + word;
            lastWordHyphenated = false;
        }

        if (word.endsWith('-')) {
            lastWord = word.slice(0, -1);
            lastWordHyphenated = true;
            return;
        }

        if (word.charAt(0) === "'" && word.endsWith("'")) word = word.split("'")[1];

        word = word.charAt(0).toUpperCase() + word.slice(1);

        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1)
    })


    await writeFile(
        `./outputs/${fileName}.json`,
        JSON.stringify(Array.from(wordFrequency.entries()).sort((a, b) => b[1] - a[1]).reverse())
    );

    const endTime = performance.now()

    console.log(`AttemptA() took ${endTime - startTime} milliseconds`);

    return true;
}


//USING REDUCE
async function attemptB(rawData, bannedWords) {
    const startTime = performance.now();

    let lastWord = '';
    let lastWordHyphenated = false;

    await writeFile(
        `./outputs/${fileName}.json`,
        JSON.stringify(
            Object.entries(rawData.reduce((stats, word) => {
                word = word.toLowerCase();

                // !isNaN(word) ||
                if (bannedWords.includes(word)) return stats;

                //Handle words that are hyphenated
                if (lastWordHyphenated) {
                    word = lastWord + word;
                    lastWordHyphenated = false;
                }

                if (word.endsWith('-')) {
                    lastWord = word.slice(0, -1);
                    lastWordHyphenated = true;
                    return stats;
                }

                if (word.charAt(0) === "'" && word.endsWith("'")) word = word.split("'")[1];

                //TODO: Capitalize all if string is roman numeral
                // let capitalizeAll = false;
                // if (word.length > 1) word.split("").forEach((char, index) => )
                // if (capitalizeAll) { }

                word = word.charAt(0).toUpperCase() + word.slice(1);

                if (word in stats) stats[word]++;
                else stats[word] = 1;

                return stats;
            }, {})).sort((a, b) => b[1] - a[1]).reverse())
    );

    const endTime = performance.now()

    console.log(`AttemptB() took ${endTime - startTime} milliseconds`);

    return true;
}