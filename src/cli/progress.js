import util from "node:util";

const LOADED_SEGMENT = '█';
const NOT_LOADED_SEGMENT = ' ';
const BAR_PERCENT_INFO_MAX_LENGTH = 5;

const isValidHex = (hex) => /^#[0-9a-fA-F]{6}$/.test(hex);

const colorizeText = (hex, text) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
};

const progress = () => {
    // Block input text
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (key) => {
        // Handle Ctrl + C combination manually
        if (key.toString() === '\u0003') process.exit();
    });

    const {values: args} = util.parseArgs({
        options: {
            duration: {type: "string", default: "5000"},
            interval: {type: "string", default: "100"},
            length: {type: "string", default: "30"},
            // The # symbol is special in some shells — it starts a comment, so everything after it gets ignored.
            // Wrap color in quotes to pass the variable. E.g. --color '#FF00FF'
            color: {type: "string"},
        }
    })

    const startTime = performance.now();

    const duration = Number(args.duration);
    const intervalTime = Number(args.interval);
    // Limit bar length by terminal width
    const length = Math.min(Number(args.length), process.stdout.columns - BAR_PERCENT_INFO_MAX_LENGTH);
    const color = args.color;

    const shouldApplyColor = Boolean(color) && isValidHex(color);

    let progress = 0;

    const printProgress = () => {
        const elapsed = performance.now() - startTime
        progress = Math.min(elapsed / duration, 1);

        const barLoadedLength = Math.floor(progress * length);
        const barNotLoadedLength = length - barLoadedLength;
        const loadedPart = shouldApplyColor
            ? colorizeText(color, LOADED_SEGMENT.repeat(barLoadedLength))
            : LOADED_SEGMENT.repeat(barLoadedLength);
        const notLoadedPart = NOT_LOADED_SEGMENT.repeat(barNotLoadedLength)
        const progressBar = `[${loadedPart}${notLoadedPart}]`;

        const percent = Math.floor((progress) * 100);

        process.stdout.write(`\r${progressBar} ${percent}%`);
    }

    printProgress();

    const interval = setInterval(() => {
        printProgress()

        if (progress === 1) {
            console.log('\nDone!');
            clearInterval(interval);
            process.stdin.setRawMode(false);
            process.stdin.pause();
        }
    }, intervalTime)
};

progress();
