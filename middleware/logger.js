import { logEvents } from "./logEvents.js";
import chalk from "chalk";

export const logger = (req, res, next) => {
    const origin = req.headers.origin || "UNKNOWN_ORIGIN";
    const message = `${req.method}\t${origin}\t${req.url}`;

    logEvents(message, "reqLog.txt");

    console.log(
        chalk.blue(`[REQUEST]`) +
        ` ${req.method} ` +
        chalk.yellow(req.url) +
        " from " +
        chalk.green(origin)
    );

    next();
};
