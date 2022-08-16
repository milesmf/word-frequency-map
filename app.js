const { readFile, writeFile } = require('fs').promises;

const fileName = process.argv[2];

if (!fileName) throw new Error("PLEASE PROVIDE AN INPUT FILE");
else if (fileName.endsWith('.txt') || fileName.endsWith('.json')) throw new Error("PLEASE DON'T PROVIDE A FILE EXTENSION");
else if (fileName.includes('/')) throw new Error("PLEASE DON'T INCLUDE A PATH, JUST THE FILE NAME");

(async () => {
    try {
        let outputData = {};

        let parseData = (await readFile(`./inputs/${fileName}.txt`, 'utf8')).replace(/[.,":?”“!‘—]|\’.*/g, '').split(/\s/);

        parseData.forEach((word, index) => {
            if (!isNaN(word)) return;

            console.log(word.includes('\n'))

            // if (word[0] === "-" && index !== 0) {
            //     word = parseData[index - 1] + word.slice(1);
            //     delete outputData[parseData[index - 1].charAt(0).toUpperCase() + parseData[index - 1].slice(1)];
            // }

            word = word.charAt(0).toUpperCase() + word.slice(1);

            if (word in outputData) outputData[word]++;
            else outputData[word] = 1;
        })

        outputData = Object.entries(outputData).sort((a, b) => {
            if (a[1] < b[1]) {
                return 1;
            } else if (a[1] > b[1]) {
                return -1;
            } else {
                return 0;
            }
        }).reverse()

        await writeFile(`./outputs/${fileName}.json`, JSON.stringify(outputData));
    } catch (error) {
        console.error(error)
    }
})()