import fs from "node:fs";
import path from "node:path";
import {ENTRY_TYPE} from "../fs/const.js";

/**
 * Recursively walks a directory and returns a flat depth-first list of all
 * files and subdirectories with their metadata.
 *
 * @param {string} dirPath - Root directory; used as the base for relative paths.
 * @param {object} [options]
 * @param {boolean} [options.parseContent=true] - Include file contents as base64.
 * @param {boolean} [options.parseSize=false]   - Include file size in bytes.
 * @param {string} [recursiveDirPathPointer=dirPath] - Current directory being read; advances during recursion.
 * @param {object[]} [entries=[]] - Accumulator passed through recursive calls.
 * @returns {Promise<object[]>} Flat array of entry descriptors ordered depth-first.
 */
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
