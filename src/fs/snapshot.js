import path from "node:path";
import {fileURLToPath} from "node:url";
import fs from "node:fs";
import {FSOperationError} from "./error.js";
import {getDirEntries} from "../shared/getDirEntities.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.dirname(__dirname);
const workspacePath = path.join(srcPath, 'workspace');
const snapshotPath = path.join(srcPath, 'snapshot.json');

const snapshot = async () => {
    try {
        await fs.promises.access(workspacePath)
    } catch (err) {
        throw new FSOperationError();
    }

    const result = {
        rootPath: await fs.promises.realpath(workspacePath),
        entries: await getDirEntries(workspacePath)
    };

    await fs.promises.writeFile(snapshotPath, JSON.stringify(result, null, 2));
};

await snapshot();
