import stream from 'node:stream';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import util from 'node:util';
import {FSOperationError} from "../shared/error.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.dirname(__dirname)
const sourcePath = path.join(srcPath, 'source.txt');

const getChunkFileName = (index) => `chunk_${index}.txt`

const cleanChunks = async () => {
    const files = await fs.promises.readdir(srcPath);

    await Promise.all(
        files
            .filter(f => /^chunk_\d+\.txt$/.test(f))
            .map(f => fs.promises.unlink(path.join(srcPath, f)))
    );
};

const split = async () => {
    try {
        await fs.promises.access(sourcePath);
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
    let writeStream = fs.createWriteStream(path.join(srcPath, getChunkFileName(chunkIndex)));

    const splitter = new stream.Writable({
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
                    writeStream = fs.createWriteStream(path.join(srcPath, getChunkFileName(chunkIndex)));
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

    await stream.promises.pipeline(
        fs.createReadStream(sourcePath),
        splitter
    );
};

split();
