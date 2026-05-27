import fs from "node:fs/promises";
import {FSOperationError} from "../shared/error.js";
import {restoreDirEntry} from "../shared/restoreDirEntry.js";
import {snapshotPath, workspaceRestoredPath} from "../shared/paths.js";

const restore = async () => {
    try {
        await fs.access(snapshotPath);
        await fs.mkdir(workspaceRestoredPath);
    } catch (err) {
        throw new FSOperationError();
    }

    try {
        const snapshotBuffer = await fs.readFile(snapshotPath);
        const snapshotString = snapshotBuffer.toString();
        const snapshot = JSON.parse(snapshotString);

        for (const entry of snapshot.entries) {
            await restoreDirEntry(entry, workspaceRestoredPath);
        }
    } catch (err) {
        await fs.rm(workspaceRestoredPath, { recursive: true });

        throw err;
    }

    console.log("Successfully restored snapshot!");
};

await restore();
