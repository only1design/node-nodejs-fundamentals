import stream from "node:stream";
import util from "node:util";

const filter = () => {
    const {values: args} = util.parseArgs({
        options: {
            pattern: { type: "string" },
        }
    })

    const pattern = args.pattern ?? '';

    // Use buffer to process chunks bigger than 64KB
    let buffer = '';

    const filterer = new stream.Transform({
        transform(chunk, encoding, callback) {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop();

            const matched = lines.filter(line => line.includes(pattern)).join('\n');
            if (matched) {
                callback(null, matched + '\n');
            } else {
                callback();
            }
        },
        flush(callback) {
            if (buffer && buffer.includes(pattern)) {
                callback(null, buffer);
            } else {
                callback();
            }
        }
    });


    stream.promises.pipeline(
        process.stdin,
        filterer,
        process.stdout
    );
};

filter();
