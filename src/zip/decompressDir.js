import fs from "node:fs/promises";
import {createReadStream} from "node:fs";
import stream from "node:stream/promises";
import zlib from "node:zlib";
import {FSOperationError} from "../shared/error.js";
import {restoreDirEntry} from "../shared/restoreDirEntry.js";
import {archivePath, decompressedPath} from "../shared/paths.js";
import readline from "node:readline";
import {Transform} from "node:stream";

const decompressDir = async () => {
    try {
        await fs.access(archivePath);
        await fs.mkdir(decompressedPath, {recursive: true});
    } catch (err) {
        throw new FSOperationError();
    }

    const archiveStream = createReadStream(archivePath);
    const decompressor = zlib.createBrotliDecompress();
    const rl = readline.createInterface({ input: decompressor, crlfDelay: Infinity });

    const entriesRestorer = new Transform({
        objectMode: true,
        transform: (line, _, callback) => callback(null, restoreDirEntry(JSON.parse(line), decompressedPath))
    });

    archiveStream.pipe(decompressor);

    await stream.pipeline(rl, entriesRestorer);

    console.log("Successfully decompressed!")
};

await decompressDir();
