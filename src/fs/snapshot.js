import path from "node:path";
import {fileURLToPath} from "node:url";
import fs from "node:fs";
import {FSOperationError} from "./error.js";
import {ENTRY_TYPE} from "./const.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.dirname(__dirname);
const workspacePath = path.join(srcPath, 'workspace');
const snapshotPath = path.join(srcPath, 'snapshot.json');

export const getEntries = async (
    dirPath,
    options = {parseContent: true},
    recursiveDirPathPointer = dirPath,
    entries = []) => {
    const dirents = await fs.promises.readdir(recursiveDirPathPointer, {withFileTypes: true});

    for (const dirent of dirents) {
        const direntPath = path.join(recursiveDirPathPointer, dirent.name);
        const direntRelativePath = path.relative(dirPath, direntPath);

        if (dirent.isDirectory()) {
            entries.push({path: direntRelativePath, type: ENTRY_TYPE.DIRECTORY});
            await getEntries(dirPath, options, direntPath, entries);
            continue;
        }

        const direntStat = await fs.promises.stat(direntPath);

        const entry = {path: direntRelativePath, type: ENTRY_TYPE.FILE, size: direntStat.size}

        if (options.parseContent) {
            const fileContentBuffer = await fs.promises.readFile(direntPath);
            entry.content = fileContentBuffer.toString('base64');
        }

        entries.push(entry);
    }

    return entries;
}

const snapshot = async () => {
    try {
        await fs.promises.access(workspacePath)
    } catch (err) {
        throw new FSOperationError();
    }

    const result = {
        rootPath: await fs.promises.realpath(workspacePath),
        entries: await getEntries(workspacePath)
    };

    await fs.promises.writeFile(snapshotPath, JSON.stringify(result, null, 2));
};

await snapshot();
