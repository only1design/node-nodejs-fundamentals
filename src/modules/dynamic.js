import util from "node:util";
import path from "node:path";
import {fileURLToPath} from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginsPath = path.join(__dirname, 'plugins');

const exit = () => {
    console.log('Plugin not found');
    process.exit(1);
}

const dynamic = async () => {
    const command = process.argv[2];

    if (!command) exit();

    const pluginPath = path.join(pluginsPath,  `${command}.js`);

    try {
        await fs.promises.access(pluginPath);
    } catch (err) {
        exit()
    }

    const {run} = await import(pluginPath)
    const result = await run();

    console.log(result)
};

await dynamic();
