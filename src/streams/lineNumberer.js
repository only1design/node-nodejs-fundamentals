import stream from 'node:stream';
import {createLineTransform} from "../shared/getLineTransform.js";

const lineNumberer = () => {
    let lineNumber = 1;

    const numberer = createLineTransform(
        line => `${lineNumber++} | ${line}`
    );

    stream.promises.pipeline(
        process.stdin,
        numberer,
        process.stdout
    );
};

lineNumberer();
