import fs from "node:fs/promises";
import {createReadStream} from "node:fs";
import stream from "node:stream/promises";
import zlib from "node:zlib";
import {FSOperationError} from "../shared/error.js";
import {createLineTransform} from "../shared/getLineTransform.js";
import {restoreDirEntry} from "../shared/restoreDirEntry.js";
import {archivePath, decompressedPath} from "../shared/paths.js";

const decompressDir = async () => {
    try {
        await fs.access(archivePath);
        await fs.mkdir(decompressedPath, {recursive: true});
    } catch (err) {
        throw new FSOperationError();
    }

    const archiveStream = createReadStream(archivePath);
    const archiver = zlib.createBrotliDecompress();
    const entriesRestorer = createLineTransform(line => {
        restoreDirEntry(JSON.parse(line), decompressedPath);
    });

    await stream.pipeline(
        archiveStream,
        archiver,
        entriesRestorer
    );

    console.log("Successfully decompressed!")
};

await decompressDir();
