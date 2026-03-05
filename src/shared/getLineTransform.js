import stream from "node:stream";

export const createLineTransform = (processLine) => {
    let buffer = '';

    return new stream.Transform({
        transform(chunk, encoding, callback) {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop();

            const output = lines
                .map(processLine)
                .filter(Boolean)
                .join('\n');

            if (output) {
                callback(null, output + '\n');
            } else {
                callback();
            }
        },
        flush(callback) {
            if (buffer) {
                const result = processLine(buffer);
                callback(null, result ?? '');
            } else {
                callback();
            }
        }
    });
};
