import db from "../db.js";
import { logEvents } from "./logEvents.js";

export const requireDB = async (req, res, next) => {
    try {
        await db.query("SELECT 1"); // szybki test połączenia DB
        next();
    } catch (err) {
        logEvents(`DB ERROR: ${err.message}`, "errLog.txt");

        return res.status(503).json({
            status: "error",
            message: "Database temporarily unavailable. Try again later."
        });
    }
};
