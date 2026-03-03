import path from "node:path";
import {fileURLToPath} from "node:url";
import fs from "node:fs";
import {ENTRY_TYPE} from "./const.js";
import {FSOperationError} from "./error.js";

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

        // Sort entries to process directories first
        snapshot.entries.sort((a, b) => (b.type === ENTRY_TYPE.DIRECTORY) - (a.type === ENTRY_TYPE.DIRECTORY));

        for (const entry of snapshot.entries) {
            const entryPath = path.join(workspacePath, entry.path);

            if (entry.type === ENTRY_TYPE.DIRECTORY) {
                await fs.promises.mkdir(entryPath, { recursive: true });
            }

            if (entry.type === ENTRY_TYPE.FILE) {
                const fileContent = Buffer.from(entry.content, 'base64');

                await fs.promises.writeFile(entryPath, fileContent)
            }
        }
    } catch (err) {
        await fs.promises.rm(workspacePath, { recursive: true });

        throw err;
    }

};

await restore();
