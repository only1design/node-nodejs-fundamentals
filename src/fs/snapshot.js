import fs from "node:fs/promises";
import {FSOperationError} from "../shared/error.js";
import {getDirEntries} from "../shared/getDirEntries.js";
import {snapshotPath, workspacePath} from "../shared/paths.js";

const snapshot = async () => {
    try {
        await fs.access(workspacePath)
    } catch (err) {
        throw new FSOperationError();
    }

    const result = {
        rootPath: await fs.realpath(workspacePath),
        entries: await getDirEntries(workspacePath)
    };

    await fs.writeFile(snapshotPath, JSON.stringify(result, null, 2));
};

await snapshot();
