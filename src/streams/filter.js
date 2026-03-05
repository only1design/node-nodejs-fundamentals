import stream from "node:stream/promises";
import util from "node:util";
import {createLineTransform} from "../shared/getLineTransform.js";

const filter = () => {
    const {values: args} = util.parseArgs({
        options: {
            pattern: { type: "string" },
        }
    })

    const pattern = args.pattern ?? '';

    const filterer = createLineTransform(
        line => line.includes(pattern) ? line : null
    );

    stream.pipeline(
        process.stdin,
        filterer,
        process.stdout
    );
};

filter();
