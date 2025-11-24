
import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import { appendFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

// Uzyskanie ścieżki katalogu
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📌 Funkcja zapisująca logi do pliku
export const logEvents = async (message, logName) => {
    const dateTime = format(new Date(), "yyyy-MM-dd\tHH:mm:ss");
    const logId = uuid();
    const logItem = `${dateTime}\t${logId}\t${message}\n`;

    try {
        const logsDir = path.join(__dirname, "..", "logs");
        if (!existsSync(logsDir)) {
            await mkdir(logsDir);
        }
        await appendFile(path.join(logsDir, logName), logItem);
    } catch (error) {
        console.error("Logging error:", error);
    }
};

// 📌 Middleware loggera (każde żądanie)
export const logger = (req, res, next) => {
    const origin = req.headers.origin || "UNKNOWN_ORIGIN";

    const message = `${req.method}\t${origin}\t${req.url}`;
    logEvents(message, "reqLog.txt");

    // 🎨 Kolorowe logi w konsoli
    console.log(
        `\x1b[36m[${req.method}]\x1b[0m ` +
        `\x1b[33m${req.url}\x1b[0m ` +
        `from \x1b[35m${origin}\x1b[0m`
    );

    next();
};
