import path from "node:path";
import {fileURLToPath} from "node:url";
import fs from "node:fs";
import {FSOperationError} from "./error.js";
import {ENTRY_TYPE} from "./const.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.dirname(__dirname);
const workspacePath = path.join(srcPath, 'workspace');
const snapshotPath = path.join(srcPath, 'snapshot.json');

const getEntries = async (dirPath, recursiveDirPathPointer = dirPath, entries = []) => {
    const dirents = await fs.promises.readdir(recursiveDirPathPointer);

    for (const dirent of dirents) {
        const direntPath = path.join(recursiveDirPathPointer, dirent);
        const direntRelativePath = path.relative(dirPath, direntPath);
        const direntStat = await fs.promises.stat(direntPath);

        if (direntStat.isDirectory()) {
            entries.push({path: direntRelativePath, type: ENTRY_TYPE.DIRECTORY});
            await getEntries(dirPath, direntPath, entries);
            continue;
        }

        const fileContentBuffer = await fs.promises.readFile(direntPath);
        const fileContent = fileContentBuffer.toString('base64');

        entries.push({path: direntRelativePath, type: ENTRY_TYPE.FILE, size: direntStat.size, content: fileContent});
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
