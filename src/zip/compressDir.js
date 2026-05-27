import path from "node:path";
import fs from "node:fs/promises";
import zlib from "node:zlib";
import stream from "node:stream/promises";
import {Readable, Transform} from "node:stream";
import {createWriteStream} from "node:fs";
import {FSOperationError} from "../shared/error.js";
import {archivePath, toCompressPath} from "../shared/paths.js";
import {getDirEntries} from "../shared/getDirEntries.js";

const compressDir = async () => {
    try {
        await fs.access(toCompressPath);
    } catch (err) {
        throw new FSOperationError();
    }

    const entries = await getDirEntries(toCompressPath, {parseContent: true, parseSize: false});

    await fs.mkdir(path.dirname(archivePath), { recursive: true });

    const entriesStream = Readable.from(entries);
    const entriesSerializer = new Transform({
        objectMode: true,
        transform: (chunk, encoding, callback) => {
            callback(null, JSON.stringify(chunk)  + '\n');
        }
    });
    const archiver = zlib.createBrotliCompress();
    const destStream = createWriteStream(archivePath);

    await stream.pipeline(
        entriesStream,
        entriesSerializer,
        archiver,
        destStream
    )

    console.log("Successfully compressed!")
};

await compressDir();
