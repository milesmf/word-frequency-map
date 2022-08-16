const { readFile, writeFile } = require('fs').promises;

const fileName = process.argv[2];

if (!fileName) throw new Error("PLEASE PROVIDE AN INPUT FILE");
else if (fileName.endsWith('.txt') || fileName.endsWith('.json')) throw new Error("PLEASE DON'T PROVIDE A FILE EXTENSION");
else if (fileName.includes('/')) throw new Error("PLEASE DON'T INCLUDE A PATH, JUST THE FILE NAME");

// HYPHEN -
//EN DASH –
//EM DASH —

(async () => {
    try {
        let lastWord = '';
        let lastWordHyphenated = false;

        const bannedWords = await readFile('./banned-words.txt', 'utf8');

        await writeFile(
            `./outputs/${fileName}.json`,
            JSON.stringify(
                Object.entries((await readFile(`./inputs/${fileName}.txt`, 'utf8')).replace(/[.,":?”“!‘]|\’|\[|\]|\(|\).*/g, '').split(/[\s,—]+/).reduce((stats, word) => {
                    if (!isNaN(word) || bannedWords.includes(word.toLowerCase())) return stats;

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

                    // if (word.includes('-')) console.log(`Hyphenated word: ${word}`);
                    // if (word.includes('–')) console.log(`En dash word: ${word}`);

                    if (word.includes('—')) console.log(`EM dash word: ${word}`);

                    word = word.charAt(0).toUpperCase() + word.slice(1);

                    if (word in stats) stats[word]++;
                    else stats[word] = 1;

                    return stats;
                }, {})).sort((a, b) => b[1] - a[1]).reverse()
            )
        );
    } catch (error) {
        console.error(error)
    }
})()