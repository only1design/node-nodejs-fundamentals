import path from "node:path";
import {fileURLToPath} from "node:url";
import util from "node:util";
import fs from "node:fs";
import {FSOperationError} from "../shared/error.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.dirname(__dirname);
const partsPath = path.join(srcPath, 'workspace', 'parts');
const mergedFilePath = path.join(srcPath, 'workspace', 'merged.txt');

const merge = async () => {
    try {
        await fs.promises.access(partsPath)
    } catch (err) {
        throw new FSOperationError();
    }

    const {values: {files: filesToFindArg}} = util.parseArgs({
        options: {
            files: {type: 'string'}
        }
    });

    let filesToFind = filesToFindArg?.split(',').filter(Boolean);

    if (!filesToFindArg) {
        const files = [];

        const dirents = await fs.promises.readdir(partsPath, { withFileTypes: true });

        for (const dirent of dirents) {
            if (!dirent.isDirectory() && path.extname(dirent.name) === '.txt') {
                files.push(dirent.name);
            }
        }

        filesToFind = files.sort()
    }

    if (!filesToFind.length) throw new Error("There are no files to merge found.");

    // First, collect the file buffers so that they are written only after all files have been processed without errors.
    const foundFilesBuffers = [];

    for (const file of filesToFind) {
        const filePath = path.join(partsPath, file);

        try {
            const fileBuffer = await fs.promises.readFile(filePath);
            foundFilesBuffers.push(fileBuffer);
        } catch (err) {
            throw new FSOperationError();
        }
    }

    await fs.promises.writeFile(mergedFilePath, Buffer.concat(foundFilesBuffers));
};

await merge();
