import stream from "node:stream";

/**
 * Creates a Transform stream that processes data line by line.
 *
 * Process incomplete line fragments between chunks.
 * Necessary because a single line may span multiple chunks —
 * e.g., a 64KB chunk boundary can split a line mid-way through.
 *
 * @param {function(string): string|null} processLine - Callback invoked for each line.
 *   Return a string to include it in output, or a falsy value to drop the line.
 * @returns {stream.Transform} A Transform stream that applies processLine to each line.
 */
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
