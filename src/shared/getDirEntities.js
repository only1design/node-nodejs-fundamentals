import fs from "node:fs";
import path from "node:path";
import {ENTRY_TYPE} from "../fs/const.js";

export const getDirEntries = async (
    dirPath,
    options = {parseContent: true, parseSize: true},
    recursiveDirPathPointer = dirPath,
    entries = []) => {
    const parseContent = options.parseContent ?? true;
    const parseSize = options.parseSize ?? false;

    const dirents = await fs.promises.readdir(recursiveDirPathPointer, {withFileTypes: true});

    for (const dirent of dirents) {
        const direntPath = path.join(recursiveDirPathPointer, dirent.name);
        const direntRelativePath = path.relative(dirPath, direntPath);

        if (dirent.isDirectory()) {
            entries.push({path: direntRelativePath, type: ENTRY_TYPE.DIRECTORY});
            await getDirEntries(dirPath, options, direntPath, entries);
            continue;
        }

        const direntStat = await fs.promises.stat(direntPath);

        const entry = {path: direntRelativePath, type: ENTRY_TYPE.FILE}

        if (parseContent) {
            const fileContentBuffer = await fs.promises.readFile(direntPath);
            entry.content = fileContentBuffer.toString('base64');
        }

        if (parseSize) {
            entry.size = direntStat.size;
        }

        entries.push(entry);
    }

    return entries;
}
