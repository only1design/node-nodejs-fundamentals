import path from "node:path";
import {ENTRY_TYPE} from "../fs/const.js";
import fs from "node:fs";

/**
 * Restores a single directory entry (file or folder) onto the filesystem
 * under the given workspace root. Intended as the inverse of getDirEntries.
 *
 * @param {object} entry - Entry descriptor produced by getDirEntries.
 * @param {string} entry.path - Relative path of the entry within the workspace.
 * @param {string} entry.type - ENTRY_TYPE.FILE or ENTRY_TYPE.DIRECTORY.
 * @param {string} [entry.content] - Base64-encoded file contents (files only).
 * @param {string} workspacePath - Absolute path to the root where entry will be restored.
 */
export const restoreDirEntry = async (entry, workspacePath) => {
    const entryPath = path.join(workspacePath, entry.path);

    if (entry.type === ENTRY_TYPE.DIRECTORY) {
        await fs.promises.mkdir(entryPath, { recursive: true });
    }

    if (entry.type === ENTRY_TYPE.FILE) {
        const fileContent = Buffer.from(entry.content, 'base64');

        await fs.promises.mkdir(path.dirname(entryPath), { recursive: true });
        await fs.promises.writeFile(entryPath, fileContent)
    }
}
