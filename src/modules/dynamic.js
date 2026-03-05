import path from "node:path";
import fs from "node:fs/promises";
import {pluginsPath} from "../shared/paths.js";

const exit = () => {
    console.log('Plugin not found');
    process.exit(1);
}

const dynamic = async () => {
    const command = process.argv[2];

    if (!command) exit();

    const pluginPath = path.join(pluginsPath,  `${command}.js`);

    try {
        await fs.access(pluginPath);
    } catch (err) {
        exit()
    }

    const {run} = await import(pluginPath)
    const result = await run();

    console.log(result)
};

await dynamic();
