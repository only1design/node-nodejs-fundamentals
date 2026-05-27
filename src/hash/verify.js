import path from "node:path";
import fs from "node:fs/promises";
import {createReadStream} from "node:fs";
import crypto from 'node:crypto'
import stream from "node:stream/promises";
import {FSOperationError} from "../shared/error.js";
import {checksumsPath, workspacePath} from "../shared/paths.js";

const verify = async () => {
    try {
        await fs.access(checksumsPath);
    } catch (err) {
        throw new FSOperationError();
    }

    const checksumsBuffer = await fs.readFile(checksumsPath);
    const checksums = JSON.parse(checksumsBuffer.toString());

    for (const fileName in checksums) {
        const filePath = path.join(workspacePath, fileName);

        try {
            await fs.access(filePath);
        } catch (err) {
            console.log(`File ${fileName} listed in checksums.json did not found.`)
            continue;
        }

        const hash = crypto.createHash('sha256');

        await stream.pipeline(
            createReadStream(path.join(workspacePath, fileName)),
            hash,
        );

        const hex = hash.digest('hex');

        const status = hex === checksums[fileName] ? "OK" : "FAIL";

        console.log(`${fileName} — ${status}`);
    }
};

await verify();
