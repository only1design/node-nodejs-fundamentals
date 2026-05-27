import readline from "node:readline";
import util from "node:util";

const UNKNOWN_COMMAND = 'Unknown command'
const SEPARATOR = '---=======---'

const interactive = () => {
    const commands = {
        uptime: () => console.log(`Uptime: ${process.uptime().toFixed(2)}s`),
        cwd: () => console.log(process.cwd()),
        date: () => console.log(new Date().toISOString()),
        exit: (rl) => rl.close()
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> ',
    })

    rl.on('line', async (line) => {
        const commandName = line.trim();
        const handleCommand = commands[commandName];

        if (handleCommand) {
            handleCommand(rl);
        } else {
            console.log(util.styleText('red', UNKNOWN_COMMAND))
        }

        if (handleCommand !== commands.exit) {
            console.log(util.styleText('dim', SEPARATOR))
            rl.prompt();
        }
    });
    rl.on('close', () => {
        console.log('Goodbye!')
    })
};

interactive();
