import { format } from "date-fns";
import { v4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import { appendFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ZAPIS DO pliku
export const logEvents = async (message, logName) => {
    const dateTime = format(new Date(), "yyyyMMdd HH:mm:ss");
    const logItem = `${dateTime}\t${v4()}\t${message}\n`;

    try {
        const logsDir = path.join(__dirname, "..", "logs");
        if (!existsSync(logsDir)) {
            await mkdir(logsDir);
        }
        await appendFile(path.join(logsDir, logName), logItem);
    } catch (err) {
        console.error("Logging error:", err);
    }
};

// LOGGER middleware
export const logger = (req, res, next) => {
    const origin = req.headers.origin || "UNKNOWN_ORIGIN";
    const message = `${req.method}\t${origin}\t${req.url}`;

    logEvents(message, "reqLog.txt");

    console.log(
        chalk.blue("[REQUEST] "),
        chalk.yellow(req.method),
        chalk.white("from"),
        chalk.green(origin)
    );

    next();
};
