import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { corsOptions } from "./config/corsOptions.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./middleware/logger.js";
import { db } from "./db.js";


dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Smart Inventory AI API is running...");
});

// ❗ Test połączenia z DB
app.get("/db-test", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");
        res.json({ time: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
