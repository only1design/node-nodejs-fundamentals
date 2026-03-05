import path from "node:path";
import {fileURLToPath} from "node:url";
import fs from "node:fs";
import {FSOperationError} from "../shared/error.js";
import * as zlib from "node:zlib";
import stream from "node:stream";
import {getDirEntries} from "../shared/getDirEntities.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.dirname(__dirname);
const workspace = path.join(srcPath, 'workspace');
const toCompressPath = path.join(workspace, 'toCompress');
const archivePath = path.join(workspace, 'compressed', 'archive.br');

const compressDir = async () => {
    try {
        await fs.promises.access(toCompressPath);
    } catch (err) {
        throw new FSOperationError();
    }

    const entries = await getDirEntries(toCompressPath, {parseContent: true, parseSize: false});

    await fs.promises.mkdir(path.dirname(archivePath), { recursive: true });

    const entriesStream = stream.Readable.from(entries);
    const entriesSerializer = new stream.Transform({
        objectMode: true,
        transform: (chunk, encoding, callback) => {
            callback(null, JSON.stringify(chunk)  + '\n');
        }
    });
    const archiver = zlib.createBrotliCompress();
    const destStream = fs.createWriteStream(archivePath);

    await stream.promises.pipeline(
        entriesStream,
        entriesSerializer,
        archiver,
        destStream
    )
};

await compressDir();
