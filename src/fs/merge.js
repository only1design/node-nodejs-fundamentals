import path from "node:path";
import util from "node:util";
import fs from "node:fs/promises";
import {FSOperationError} from "../shared/error.js";
import {mergedFilePath, partsPath} from "../shared/paths.js";
import {randomUUID} from "node:crypto";
import {createReadStream, createWriteStream} from "node:fs";
import stream from "node:stream/promises";

const merge = async () => {
    try {
        await fs.access(partsPath)
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

        const dirents = await fs.readdir(partsPath, {withFileTypes: true});

        for (const dirent of dirents) {
            if (!dirent.isDirectory() && path.extname(dirent.name) === '.txt') {
                files.push(dirent.name);
            }
        }

        filesToFind = files.sort()
    }

    if (!filesToFind.length) throw new Error("There are no files to merge found.");

    const tmpPath = `${mergedFilePath}.${randomUUID()}.tmp`;
    const outputFileStream = createWriteStream(tmpPath);

    for (const file of filesToFind) {
        const filePath = path.join(partsPath, file);

        try {
            const inputFileStream = createReadStream(filePath)

            await stream.pipeline(inputFileStream, outputFileStream, {end: false});
        } catch (err) {
            await fs.rm(tmpPath, {force: true});
            throw new FSOperationError();
        }
    }

    outputFileStream.end()

    await fs.rename(tmpPath, mergedFilePath);

    console.log(`Successfully merged files!`);
};

await merge();
