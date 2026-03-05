import path from "node:path";
import {ENTRY_TYPE} from "../fs/const.js";
import fs from "node:fs";

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
