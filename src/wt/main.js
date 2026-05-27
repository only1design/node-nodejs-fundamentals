import fs from "node:fs/promises";
import os from "node:os";
import {Worker} from 'node:worker_threads';
import {dataPath, workerPath} from "../shared/paths.js";

const splitIntoChunks = (arr, numChunks) => {
    const size = Math.ceil(arr.length / numChunks);
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

const runWorker = (workerData) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(workerPath)

        worker.postMessage(workerData)

        worker.on('message', (data) => {
            resolve(data)
        })

        worker.on('error', (err) => {
            reject(err)
        })
    })
}

const kWayMerge = (sortedArrays) => {
    const candidates = [];
    const result = [];

    for (let arrayIndex = 0; arrayIndex < sortedArrays.length; arrayIndex++) {
        candidates.push({
            candidateValue: sortedArrays[arrayIndex][0],
            elementIndex: 0,
            arrayIndex,
        });
    }

    while (candidates.length > 0) {
        let smallestCandidateIndex = 0;
        for (let i = 1; i < candidates.length; i++) {
            if (candidates[i].candidateValue < candidates[smallestCandidateIndex].candidateValue)
                smallestCandidateIndex = i;
        }

        const {candidateValue, elementIndex, arrayIndex} = candidates[smallestCandidateIndex];

        result.push(candidateValue);

        const nextElementIndex = elementIndex + 1;
        const isArrayExhausted = sortedArrays[arrayIndex].length === nextElementIndex;

        if (isArrayExhausted) {
            candidates.splice(smallestCandidateIndex, 1)
        } else {
            candidates[smallestCandidateIndex].candidateValue = sortedArrays[arrayIndex][nextElementIndex]
            candidates[smallestCandidateIndex].elementIndex = nextElementIndex
        }
    }

    return result;
}

const main = async () => {
    const cpuNum = os.cpus().length;
    const dataBuffer = await fs.readFile(dataPath);
    const data = JSON.parse(dataBuffer.toString());
    const chunks = splitIntoChunks(data, cpuNum);

    const sortedArrays = await Promise.all(chunks.map(chunk => runWorker(chunk)))

    const result = kWayMerge(sortedArrays)

    console.log(result)
};

await main();
