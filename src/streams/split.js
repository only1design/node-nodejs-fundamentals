import stream from 'node:stream/promises';
import {Writable} from 'node:stream';
import fs from 'node:fs/promises';
import {createReadStream, createWriteStream} from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import {FSOperationError} from "../shared/error.js";
import {sourcePath, workspacePath} from "../shared/paths.js";

const getChunkFileName = (index) => `chunk_${index}.txt`

const cleanChunks = async () => {
    const files = await fs.readdir(workspacePath);

    await Promise.all(
        files
            .filter(f => /^chunk_\d+\.txt$/.test(f))
            .map(f => fs.unlink(path.join(workspacePath, f)))
    );
};

const split = async () => {
    try {
        await fs.access(sourcePath);
    } catch (err) {
        throw new FSOperationError();
    }

    const { values: args } = util.parseArgs({
        options: { lines: { type: 'string', default: '10' } }
    });

    const linesPerChunk = Number(args.lines);

    await cleanChunks()

    if (linesPerChunk <= 0) throw new Error('Invalid lines per chunk argument');

    let chunkIndex = 1;
    let lineCount = 0;
    let buffer = '';
    let writeStream = createWriteStream(path.join(workspacePath, getChunkFileName(chunkIndex)));

    const splitter = new Writable({
        write(chunk, encoding, callback) {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                writeStream.write(line + '\n');
                if (++lineCount >= linesPerChunk) {
                    writeStream.end();
                    chunkIndex++;
                    lineCount = 0;
                    writeStream = createWriteStream(path.join(workspacePath, getChunkFileName(chunkIndex)));
                }
            }

            callback();
        },
        final(callback) {
            if (buffer) writeStream.write(buffer);
            writeStream.end();
            callback();
        }
    });

    await stream.pipeline(
        createReadStream(sourcePath),
        splitter
    );
};

split();
