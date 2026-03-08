import stream from "node:stream/promises";
import util from "node:util";
import readline from "node:readline";
import {Transform} from "node:stream";

const filter = () => {
    const {values: args} = util.parseArgs({
        options: {
            pattern: {type: "string"},
        }
    })

    const pattern = args.pattern ?? '';

    const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
    const transform = new Transform({
        objectMode: true,
        transform(line, _, callback) {
            if (line.includes(pattern)) return callback(null, line + '\n');

            callback();
        },
    })

    stream.pipeline(
        rl,
        transform,
        process.stdout
    );
};

filter();
