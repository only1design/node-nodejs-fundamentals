import path from "node:path";
import {fileURLToPath} from "node:url";
import fs from "node:fs";
import {FSOperationError} from "../fs/error.js";
import crypto from 'node:crypto'
import * as stream from "node:stream";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.dirname(__dirname);
const checksumsPath = path.join(srcPath, 'checksums.json');

const verify = async () => {
    try {
        await fs.promises.access(checksumsPath);
    } catch (err) {
        throw new FSOperationError();
    }

    const checksumsBuffer = await fs.promises.readFile(checksumsPath);
    const checksums = JSON.parse(checksumsBuffer.toString());

    for (const fileName in checksums) {
        const filePath = path.join(srcPath, fileName);

        try {
            await fs.promises.access(filePath);
        } catch (err) {
            console.log(`File ${fileName} listed in checksums.json did not found.`)
            continue;
        }

        const hash = crypto.createHash('sha256');

        await stream.promises.pipeline(
            fs.createReadStream(path.join(srcPath, fileName)),
            hash,
        );

        const hex = hash.digest('hex');

        const status = hex === checksums[fileName] ? "OK" : "FAIL";

        console.log(`${fileName} — ${status}`);
    }
};

await verify();
