import path from "node:path";
import {fileURLToPath} from "node:url";
import fs from "node:fs";
import {ENTRY_TYPE} from "./const.js";
import {FSOperationError} from "../shared/error.js";
import {restoreDirEntry} from "../shared/restoreDirEntry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.dirname(__dirname);
const workspacePath = path.join(srcPath, 'workspace_restored');
const snapshotPath = path.join(srcPath, 'snapshot.json');

const restore = async () => {
    try {
        await fs.promises.access(snapshotPath);
        await fs.promises.mkdir(workspacePath);
    } catch (err) {
        throw new FSOperationError();
    }

    try {
        const snapshotBuffer = await fs.promises.readFile(snapshotPath);
        const snapshotString = snapshotBuffer.toString();
        const snapshot = JSON.parse(snapshotString);

        for (const entry of snapshot.entries) {
            await restoreDirEntry(entry, workspacePath);
        }
    } catch (err) {
        await fs.promises.rm(workspacePath, { recursive: true });

        throw err;
    }

};

await restore();
