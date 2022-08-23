const { readFile, writeFile } = require('fs').promises;

const fileName = process.argv[2];

if (!fileName) throw new Error("PLEASE PROVIDE AN INPUT FILE");
else if (fileName.endsWith('.txt') || fileName.endsWith('.json')) throw new Error("PLEASE DON'T PROVIDE A FILE EXTENSION");
else if (fileName.includes('/')) throw new Error("PLEASE DON'T INCLUDE A PATH, JUST THE FILE NAME");

// HYPHEN -
//EN DASH –
//EM DASH —
// ―

// if (word.includes('-'))  (`Hyphenated word: ${word}`);
// if (word.includes('–')) console.log(`En dash word: ${word}`);
// if (word.includes('—')) console.log(`EM dash word: ${word}`);

(async () => {
    try {
        const rawData = (await readFile(`./inputs/${fileName}.txt`, 'utf8')).replace(/[.,":?”“!‘;']|\’|\[|\]|\(|\).*/g, '').split(/[\s]|--|―|-/);

        const bannedWords = await readFile('./banned-words.txt', 'utf8');

        const dictionary = JSON.parse(await readFile('./dictionary/index.json', 'utf-8'))
        const missingWords = [];

        //USING new Map() //Less performant than attemptB when dictionary parsing was implemented
        await attemptA(rawData, bannedWords);

        //USING [].reduce()
        await attemptB(rawData, bannedWords);

        //Utility to concate two dictionaries
        // await mergeDictionaries();

        //USING MAP
        async function attemptA() {
            const startTime = performance.now();

            const wordFrequency = new Map();

            let lastWord = '';
            let lastWordHyphenated = false;

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

                if (wordFrequency.has(word)) {
                    const existingWord = wordFrequency.get(word);
                    wordFrequency.set(word, [existingWord[0] + 1, existingWord[1]])
                } else {
                    if (!(word in dictionary)) missingWords.push(word);
                    wordFrequency.set(word, [1, dictionary[word] || ""])
                }
            })

            await writeFile(
                `./outputs/${fileName}.json`,
                JSON.stringify(Array.from(wordFrequency.entries()).sort((a, b) => b[1][0] - a[1][0]).reverse())
            );

            const endTime = performance.now()

            console.log(`AttemptA() took ${endTime - startTime} milliseconds`);

            await logMissingWords();
        }


        //USING REDUCE
        async function attemptB() {
            const startTime = performance.now();

            let lastWord = '';
            let lastWordHyphenated = false;

            await writeFile(
                `./outputs/${fileName}.json`,
                JSON.stringify(
                    Object.entries(rawData.reduce((stats, word) => {
                        word = word.toLowerCase();

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

                        if (word in stats) {
                            stats[word] = [stats[word][0] + 1, stats[word][1]]
                        } else {
                            if (!(word in dictionary)) missingWords.push(word);
                            stats[word] = [1, dictionary[word] || ""];
                        }

                        return stats;
                    }, {})).sort((a, b) => b[1][0] - a[1][0]).reverse())
            );

            const endTime = performance.now()

            console.log(`AttemptB() took ${endTime - startTime} milliseconds`);

            await logMissingWords();
        }

        async function mergeDictionaries() {
            try {
                await writeFile(
                    `./dictionary/index.json`,
                    JSON.stringify({ ...JSON.parse(await readFile(`./dictionary/index.json`, 'utf8')), ...JSON.parse(await readFile(`./dictionary/temp.json`, 'utf8')) })
                )
            } catch (error) {
                console.error(error);
            }
        }

        async function logMissingWords() {
            try {
                console.log(`Dictionary was missing ${missingWords.length} words`);

                await writeFile(
                    './dictionary/missing.json',
                    JSON.stringify([...missingWords, ...JSON.parse(await readFile('./dictionary/missing.json', 'utf-8'))])
                )
            } catch (error) {
                console.error(error);
            }
        }

        async function checkDictionaryIncludes(word) {
            try {
                // if (word.endsWith('ed')) word = word.slice(0, word.length - 2);
                // else if (word.endsWith('ing')) word = word.slice(0, word.length - 3);


                return definition;
            } catch (error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error)
    }
})()