import { spawn } from 'node:child_process';

const execCommand = () => {
    const command = process.argv[2];

    if (!command) {
        console.error('No command provided');
        process.exit(1);
    }

    const child = spawn(command, {
        shell: true,
        stdio: 'inherit',
        env: process.env,
    });

    child.on('close', (exitCode) => {
        process.exit(exitCode);
    });
};

execCommand();
