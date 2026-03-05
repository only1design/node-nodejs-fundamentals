import path from "node:path";
import {fileURLToPath} from "node:url";
import * as util from "node:util";
import fs from "node:fs";
import {ENTRY_TYPE} from "./const.js";
import {FSOperationError} from "./error.js";

import {getDirEntries} from "../shared/getDirEntities.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.dirname(__dirname);
const workspacePath = path.join(srcPath, 'workspace');

const findByExt = async () => {
    try {
        await fs.promises.access(workspacePath)
    } catch (err) {
        throw new FSOperationError();
    }

    const { values: {ext} } = util.parseArgs({
        options: {
            ext: { type: 'string', default: 'txt' }
        }
    });

    // Set parseContent option to false to make the function execution more cost-effective
    const entries = await getDirEntries(workspacePath, {parseContent: false, parseSize: false});
    const files = entries
        .filter(entry => entry.type === ENTRY_TYPE.FILE && path.extname(entry.path) === `.${ext}`)
        .sort((a, b) => a.path.localeCompare(b.path));

    files.forEach((file) => console.log(file.path))

};

await findByExt();
