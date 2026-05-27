import stream from 'node:stream/promises';
import readline from "node:readline";
import {Transform} from "node:stream";

const lineNumberer = () => {
    let lineNumber = 1;

    const rl = readline.createInterface({input: process.stdin, crlfDelay: Infinity });
    const numberer = new Transform({
        objectMode: true,
        transform: (line, _, callback) => callback(null, `${lineNumber++} | ${line}\n`),
    });

    stream.pipeline(
        rl,
        numberer,
        process.stdout
    );
};

lineNumberer();
