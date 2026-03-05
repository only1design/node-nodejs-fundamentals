import path from "node:path";
import {fileURLToPath} from "node:url";
import fs from "node:fs";
import {FSOperationError} from "../shared/error.js";
import stream from "node:stream";
import zlib from "node:zlib";
import {createLineTransform} from "../shared/getLineTransform.js";
import {restoreDirEntry} from "../shared/restoreDirEntry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.dirname(__dirname);
const workspace = path.join(srcPath, 'workspace');
const archivePath = path.join(workspace, 'compressed', 'archive.br');
const decompressedPath = path.join(workspace, 'decompressed');

const decompressDir = async () => {
    try {
        await fs.promises.access(archivePath);
        await fs.promises.mkdir(decompressedPath, {recursive: true});
    } catch (err) {
        throw new FSOperationError();
    }

    const archiveStream = fs.createReadStream(archivePath);
    const archiver = zlib.createBrotliDecompress();
    const entriesRestorer = createLineTransform(line => {
        restoreDirEntry(JSON.parse(line), decompressedPath);
    });

    await stream.promises.pipeline(
        archiveStream,
        archiver,
        entriesRestorer
    );
};

await decompressDir();
