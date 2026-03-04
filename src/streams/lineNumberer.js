import stream from 'node:stream';

const lineNumberer = () => {
    let lineNumber = 1;
    // Use buffer to process chunks bigger than 64KB
    let buffer = '';

    const numberer = new stream.Transform({
        transform(chunk, encoding, callback) {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop();

            if (lines.length) {
                const numbered = lines.map(line => `${lineNumber++} | ${line}`).join('\n') + '\n';
                callback(null, numbered);
            } else {
                callback();
            }
        },
        flush(callback) {
            if (buffer) {
                callback(null, `${lineNumber} | ${buffer}`);
            } else {
                callback();
            }
        }
    });

    stream.promises.pipeline(
        process.stdin,
        numberer,
        process.stdout
    );
};

lineNumberer();
