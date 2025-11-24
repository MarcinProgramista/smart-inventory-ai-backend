import { format } from "date-fns";
import { v4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import { appendFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), "yyyyMMdd\tHH:mm:ss\t")}`;
    const logItem = `${dateTime}\t${v4()}\t${message}\n`;

    try {
        if (!existsSync(path.join(__dirname, "..", "logs"))) {
            await mkdir(path.join(__dirname, "..", "logs"));
        }
        await appendFile(path.join(__dirname, "..", "logs", logName), logItem);
    } catch (error) {
        console.log(error);
    }
};

export const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, "reqLog.txt");
    console.log(`${req.method} ${req.path}`);
    next();
};
